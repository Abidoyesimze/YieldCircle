// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "./KaiaYieldStrategyManager.sol";
import "./libraries/RandomGenerator.sol";

/**
 * @title Yield Circle Main Contract
 * @dev Trust-based group savings with real Kaia DeFi yield integration
 * @author Yield Circle Team
 */
contract YieldCircle is ReentrancyGuard, Pausable {

    
    IERC20 public immutable USDT;
    KaiaYieldStrategyManager public immutable yieldManager;
    RandomGenerator public immutable randomGenerator;
    
    struct Member {
        address wallet;
        string name;
        uint256 payoutPosition;    // 1, 2, 3, etc.
        bool hasContributed;       // Current cycle
        bool hasReceivedPayout;    // Lifetime
        uint256 totalContributions;
        uint256 joinedTimestamp;
        bool isActive;             // For handling defaults
    }
    
    struct CircleInfo {
        string name;
        address creator;
        uint256 contributionAmount;
        uint256 cycleDuration;
        uint256 currentCycle;
        uint256 totalCycles;
        uint256 cycleStartTime;
        uint256 poolBalance;
        uint256 totalYieldEarned;
        uint256 totalDistributed;
        CirclePhase phase;
        bool isActive;
        bool emergencyPaused;
        uint256 randomRequestId;   // VRF request ID
        bool positionsInitialized; // Whether random positions are set
    }
    
    enum CirclePhase { 
        SETUP,              // Members joining
        WAITING_RANDOM,     // Waiting for VRF callback
        COLLECTING,         // Accepting contributions
        INVESTING,          // Funds being invested
        PAYOUT_READY,       // Ready for payout
        COMPLETED,          // All payouts done
        PAUSED              // Emergency pause
    }
    
    CircleInfo public circle;
    mapping(address => Member) public members;
    address[] public memberList;
    mapping(uint256 => mapping(address => uint256)) public contributions; // cycle => member => amount
    mapping(uint256 => address) public payoutSchedule; // cycle => recipient
    
    // Investment tracking
    string public currentStrategy;
    uint256 public totalInvested;
    uint256 public lastYieldUpdate;
    
    // Security controls
    uint256 public constant MAX_MEMBERS = 50;
    uint256 public constant MIN_CONTRIBUTION = 10e6; // $10 minimum
    uint256 public constant MAX_CONTRIBUTION = 10000e6; // $10,000 maximum
    uint256 public constant MIN_CYCLE_DURATION = 1 days;
    uint256 public constant MAX_CYCLE_DURATION = 365 days;
    
    // Events
    event MemberJoined(address indexed member, string name, uint256 position);
    event CircleStarted(uint256 startTime, uint256 firstCycleDeadline);
    event ContributionMade(address indexed member, uint256 cycle, uint256 amount);
    event InvestmentPhaseStarted(string strategy, uint256 amount, string explanation);
    event PayoutExecuted(address indexed recipient, uint256 amount, uint256 cycle, uint256 yieldShare);
    event CycleAdvanced(uint256 newCycle, address nextRecipient);
    event CircleCompleted(uint256 totalYield, uint256 totalDistributed);
    event EmergencyAction(string action, string reason);
    event YieldUpdated(uint256 newYieldTotal);
    event PositionsInitialized(uint256[] positions);
    event MemberDefaultHandled(address indexed member, bool removed, string reason);
    
    // Errors
    error CircleNotActive();
    error InvalidPhase();
    error MemberNotFound();
    error AlreadyContributed();
    error AlreadyReceivedPayout();
    error InsufficientFunds();
    error InvalidAmount();
    error PositionsNotInitialized();
    error TooManyMembers();
    error InvalidContributionAmount();
    error InvalidCycleDuration();
    error CreatorOnly();
    error MemberOnly();
    
    // Modifiers
    modifier onlyCreator() {
        if (msg.sender != circle.creator) revert CreatorOnly();
        _;
    }
    
    modifier onlyMember() {
        if (members[msg.sender].wallet == address(0)) revert MemberNotFound();
        _;
    }
    
    modifier onlyPhase(CirclePhase phase) {
        if (circle.phase != phase) revert InvalidPhase();
        _;
    }
    
    modifier whenActive() {
        if (!circle.isActive || circle.emergencyPaused) revert CircleNotActive();
        _;
    }
    
    modifier whenPositionsInitialized() {
        if (!circle.positionsInitialized) revert PositionsNotInitialized();
        _;
    }
    
    constructor(
        address _usdt,
        address _yieldManager,
        address _randomGenerator,
        address[] memory _members,
        uint256 _contributionAmount,
        uint256 _cycleDuration,
        string memory _name,
        address _creator,
        uint256 _randomRequestId
    ) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_yieldManager != address(0), "Invalid yield manager address");
        require(_randomGenerator != address(0), "Invalid random generator address");
        require(_members.length > 0 && _members.length <= MAX_MEMBERS, "Invalid member count");
        require(_contributionAmount >= MIN_CONTRIBUTION && _contributionAmount <= MAX_CONTRIBUTION, "Invalid contribution amount");
        require(_cycleDuration >= MIN_CYCLE_DURATION && _cycleDuration <= MAX_CYCLE_DURATION, "Invalid cycle duration");
        require(bytes(_name).length > 0 && bytes(_name).length <= 64, "Invalid name length");
        require(_creator != address(0), "Invalid creator address");
        
        USDT = IERC20(_usdt);
        yieldManager = KaiaYieldStrategyManager(_yieldManager);
        randomGenerator = RandomGenerator(_randomGenerator);
        
        circle = CircleInfo({
            name: _name,
            creator: _creator,
            contributionAmount: _contributionAmount,
            cycleDuration: _cycleDuration,
            currentCycle: 0,
            totalCycles: _members.length,
            cycleStartTime: 0,
            poolBalance: 0,
            totalYieldEarned: 0,
            totalDistributed: 0,
            phase: CirclePhase.SETUP,
            isActive: true,
            emergencyPaused: false,
            randomRequestId: _randomRequestId,
            positionsInitialized: false
        });
        
        // Initialize members (positions will be set later)
        for (uint i = 0; i < _members.length; i++) {
            require(_members[i] != address(0), "Invalid member address");
            memberList.push(_members[i]);
            members[_members[i]] = Member({
                wallet: _members[i],
                name: "",
                payoutPosition: 0, // Will be set after VRF callback
                hasContributed: false,
                hasReceivedPayout: false,
                totalContributions: 0,
                joinedTimestamp: block.timestamp,
                isActive: true
            });
        }
    }
    
    /**
     * @dev Initialize circle with random positions from VRF
     * @param positions Array of randomized positions (1-based)
     */
    function initializeWithPositions(uint256[] memory positions) external {
        require(msg.sender == address(yieldManager) || msg.sender == circle.creator, "Not authorized");
        require(!circle.positionsInitialized, "Already initialized");
        require(positions.length == memberList.length, "Position count mismatch");
        
        // Validate positions (1 to memberCount)
        for (uint i = 0; i < positions.length; i++) {
            require(positions[i] >= 1 && positions[i] <= memberList.length, "Invalid position");
        }
        
        // Set positions and payout schedule
        for (uint i = 0; i < memberList.length; i++) {
            members[memberList[i]].payoutPosition = positions[i];
            payoutSchedule[positions[i]] = memberList[i];
        }
        
        circle.positionsInitialized = true;
        circle.phase = CirclePhase.SETUP;
        
        emit PositionsInitialized(positions);
    }
    
    /**
     * @dev Members join the circle and set their display name
     */
    function joinCircle(string memory displayName) external onlyMember onlyPhase(CirclePhase.SETUP) whenPositionsInitialized {
        require(bytes(displayName).length > 0 && bytes(displayName).length <= 32, "Invalid name");
        require(bytes(members[msg.sender].name).length == 0, "Already joined");
        
        members[msg.sender].name = displayName;
        emit MemberJoined(msg.sender, displayName, members[msg.sender].payoutPosition);
    }
    
    /**
     * @dev Creator starts the circle once all members have joined
     */
    function startCircle() external onlyCreator onlyPhase(CirclePhase.SETUP) whenActive whenPositionsInitialized {
        // Verify all members have joined
        for (uint i = 0; i < memberList.length; i++) {
            require(bytes(members[memberList[i]].name).length > 0, "Not all members joined");
        }
        
        // Start first cycle
        circle.currentCycle = 1;
        circle.cycleStartTime = block.timestamp;
        circle.phase = CirclePhase.COLLECTING;
        
        uint256 contributionDeadline = block.timestamp + circle.cycleDuration - 3 days;
        emit CircleStarted(block.timestamp, contributionDeadline);
    }
    
    /**
     * @dev Members make their monthly/weekly contributions
     */
    function contribute() external onlyMember onlyPhase(CirclePhase.COLLECTING) whenActive nonReentrant {
        require(!members[msg.sender].hasContributed, "Already contributed this cycle");
        require(members[msg.sender].isActive, "Member not active");
        require(
            block.timestamp <= circle.cycleStartTime + circle.cycleDuration - 3 days,
            "Contribution period ended"
        );
        
        // Transfer USDT from member to circle
        require(USDT.transferFrom(msg.sender, address(this), circle.contributionAmount), "Transfer failed");
        
        // Update member and circle state
        members[msg.sender].hasContributed = true;
        members[msg.sender].totalContributions = members[msg.sender].totalContributions + circle.contributionAmount;
        circle.poolBalance = circle.poolBalance + circle.contributionAmount;
        contributions[circle.currentCycle][msg.sender] = circle.contributionAmount;
        
        emit ContributionMade(msg.sender, circle.currentCycle, circle.contributionAmount);
        
        // Check if all active members have contributed
        if (_allActiveMembersContributed()) {
            _startInvestmentPhase();
        }
    }
    
    /**
     * @dev Automatic investment phase with AI strategy selection
     */
    function _startInvestmentPhase() internal {
        circle.phase = CirclePhase.INVESTING;
        
        // Calculate investable amount (keep payout amount liquid)
        uint256 payoutAmount = circle.contributionAmount * _getActiveMemberCount();
        uint256 investableAmount = circle.poolBalance > payoutAmount ? 
            circle.poolBalance - payoutAmount : 0;
        
        if (investableAmount >= 25e6) { // Minimum $25 for investment
            // Calculate circle's risk profile
            uint256 riskTolerance = _calculateRiskTolerance();
            uint256 timeUntilPayout = circle.cycleDuration - 7 days; // 7-day buffer
            
            // AI selects best strategy
            (string memory selectedStrategy, string memory explanation) = yieldManager.selectBestStrategy(
                address(this),
                investableAmount,
                timeUntilPayout,
                riskTolerance
            );
            
            // Execute investment
            USDT.approve(address(yieldManager), investableAmount);
            yieldManager.investInStrategy(address(this), investableAmount, selectedStrategy);
            
            currentStrategy = selectedStrategy;
            totalInvested = investableAmount;
            lastYieldUpdate = block.timestamp;
            
            emit InvestmentPhaseStarted(selectedStrategy, investableAmount, explanation);
        }
        
        // Move to payout ready phase
        circle.phase = CirclePhase.PAYOUT_READY;
    }
    
    /**
     * @dev Calculate circle's risk tolerance based on various factors
     */
    function _calculateRiskTolerance() internal view returns (uint256) {
        uint256 riskTolerance = 5; // Base moderate risk
        
        // Adjust based on circle characteristics
        if (circle.totalCycles >= 12) riskTolerance = riskTolerance + 1; // Longer circles = higher risk tolerance
        if (circle.contributionAmount >= 500e6) riskTolerance = riskTolerance + 1; // Higher contributions = more sophisticated users
        if (circle.cycleDuration >= 60 days) riskTolerance = riskTolerance + 1; // Longer cycles = more time for yield
        
        // Decrease for newer circles or first few cycles
        if (circle.currentCycle <= 2) riskTolerance = riskTolerance > 1 ? riskTolerance - 1 : 1;
        
        // Cap between 1-10
        if (riskTolerance > 10) riskTolerance = 10;
        if (riskTolerance < 1) riskTolerance = 1;
        
        return riskTolerance;
    }
    
    /**
     * @dev Execute payout to the designated member for this cycle
     */
    function executePayout() external onlyPhase(CirclePhase.PAYOUT_READY) whenActive nonReentrant {
        require(
            block.timestamp >= circle.cycleStartTime + circle.cycleDuration - 2 days,
            "Too early for payout"
        );
        
        address recipient = payoutSchedule[circle.currentCycle];
        require(recipient != address(0), "No recipient for this cycle");
        require(members[recipient].isActive, "Recipient not active");
        require(!members[recipient].hasReceivedPayout, "Recipient already received payout");
        
        // Calculate base payout (all contributions for this cycle)
        uint256 basePayout = circle.contributionAmount * _getActiveMemberCount();
        
        // Calculate yield share
        uint256 currentYield = yieldManager.getCurrentYield(address(this));
        uint256 yieldShare = currentYield / _getActiveMemberCount();
        uint256 totalPayout = basePayout + yieldShare;
        
        // Withdraw from strategy if needed
        if (circle.poolBalance < totalPayout && totalInvested > 0) {
            uint256 needed = totalPayout - circle.poolBalance;
            uint256 withdrawn = yieldManager.withdrawFromStrategy(address(this), needed);
            circle.poolBalance = circle.poolBalance + withdrawn;
            
            // Update yield tracking
            if (withdrawn > needed) {
                uint256 additionalYield = withdrawn - needed;
                circle.totalYieldEarned = circle.totalYieldEarned + additionalYield;
                emit YieldUpdated(circle.totalYieldEarned);
            }
        }
        
        // Ensure we have minimum base payout
        require(circle.poolBalance >= basePayout, "Insufficient funds for base payout");
        
        // Execute payout (base + available yield)
        uint256 actualPayout = circle.poolBalance >= totalPayout ? totalPayout : circle.poolBalance;
        uint256 actualYieldShare = actualPayout - basePayout;
        
        USDT.transfer(recipient, actualPayout);
        
        // Update state
        members[recipient].hasReceivedPayout = true;
        circle.poolBalance = circle.poolBalance - actualPayout;
        circle.totalDistributed = circle.totalDistributed + actualPayout;
        if (actualYieldShare > 0) {
            circle.totalYieldEarned = circle.totalYieldEarned + actualYieldShare;
        }
        
        emit PayoutExecuted(recipient, actualPayout, circle.currentCycle, actualYieldShare);
        
        // Advance to next cycle or complete
        _advanceToNextCycle();
    }
    
    /**
     * @dev Advance to the next cycle or complete the circle
     */
    function _advanceToNextCycle() internal {
        if (circle.currentCycle >= circle.totalCycles) {
            // Circle completed
            circle.phase = CirclePhase.COMPLETED;
            circle.isActive = false;
            
            emit CircleCompleted(circle.totalYieldEarned, circle.totalDistributed);
        } else {
            // Start next cycle
            circle.currentCycle = circle.currentCycle + 1;
            circle.cycleStartTime = block.timestamp;
            circle.phase = CirclePhase.COLLECTING;
            
            // Reset contribution flags for new cycle
            for (uint i = 0; i < memberList.length; i++) {
                if (members[memberList[i]].isActive) {
                    members[memberList[i]].hasContributed = false;
                }
            }
            
            address nextRecipient = payoutSchedule[circle.currentCycle];
            emit CycleAdvanced(circle.currentCycle, nextRecipient);
        }
    }
    
    // ============================================================================
    // EMERGENCY AND GOVERNANCE FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Handle member default (social resolution)
     */
    function handleMemberDefault(
        address defaultMember, 
        bool removeFromCircle,
        string memory reason
    ) external onlyCreator whenActive {
        require(members[defaultMember].wallet != address(0), "Not a member");
        require(members[defaultMember].isActive, "Member already inactive");
        require(!members[defaultMember].hasContributed, "Member already contributed");
        require(circle.phase == CirclePhase.COLLECTING, "Can only handle defaults during collection");
        
        if (removeFromCircle) {
            // Remove member from future payouts
            uint256 defaulterPosition = members[defaultMember].payoutPosition;
            members[defaultMember].isActive = false;
            
            // Mark their payout slot as void
            if (payoutSchedule[defaulterPosition] == defaultMember) {
                payoutSchedule[defaulterPosition] = address(0);
            }
            
            // Reduce total cycles since we have one less recipient
            circle.totalCycles = circle.totalCycles - 1;
        }
        
        emit MemberDefaultHandled(defaultMember, removeFromCircle, reason);
        
        // Check if remaining members have all contributed
        if (_allActiveMembersContributed()) {
            _startInvestmentPhase();
        }
    }
    
    /**
     * @dev Emergency pause by creator
     */
    function emergencyPause(string memory reason) external onlyCreator {
        circle.emergencyPaused = true;
        circle.phase = CirclePhase.PAUSED;
        _pause();
        emit EmergencyAction("CirclePaused", reason);
    }
    
    /**
     * @dev Resume after emergency pause
     */
    function resumeCircle() external onlyCreator {
        require(circle.emergencyPaused, "Circle not paused");
        circle.emergencyPaused = false;
        _unpause();
        
        // Restore appropriate phase based on state
        if (circle.currentCycle == 0) {
            circle.phase = CirclePhase.SETUP;
        } else if (circle.poolBalance == 0) {
            circle.phase = CirclePhase.COLLECTING;
        } else {
            circle.phase = CirclePhase.PAYOUT_READY;
        }
        
        emit EmergencyAction("CircleResumed", "");
    }
    
    /**
     * @dev Emergency distribution of remaining funds
     */
    function emergencyDistribute(string memory reason) external onlyCreator {
        require(circle.emergencyPaused, "Must pause first");
        
        if (circle.poolBalance > 0) {
            uint256 activeMembers = _getActiveMemberCount();
            if (activeMembers > 0) {
                uint256 perMember = circle.poolBalance / activeMembers;
                
                // Distribute equally among active members
                for (uint i = 0; i < memberList.length; i++) {
                    if (members[memberList[i]].isActive && perMember > 0) {
                        USDT.transfer(memberList[i], perMember);
                        circle.totalDistributed = circle.totalDistributed + perMember;
                    }
                }
                
                circle.poolBalance = 0;
            }
        }
        
        circle.phase = CirclePhase.COMPLETED;
        circle.isActive = false;
        
        emit EmergencyAction("EmergencyDistribution", reason);
    }
    
    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================
    
    /**
     * @dev Get comprehensive circle status
     */
    function getCircleStatus() external view returns (
        string memory name,
        uint256 currentCycle,
        uint256 totalCycles,
        uint256 poolBalance,
        uint256 contributionAmount,
        CirclePhase phase,
        address nextRecipient,
        uint256 timeUntilDeadline,
        bool isActive,
        bool positionsInitialized
    ) {
        uint256 deadline;
        if (circle.phase == CirclePhase.COLLECTING) {
            deadline = circle.cycleStartTime + circle.cycleDuration - 3 days;
        } else if (circle.phase == CirclePhase.PAYOUT_READY) {
            deadline = circle.cycleStartTime + circle.cycleDuration;
        }
        
        uint256 timeLeft = block.timestamp < deadline ? deadline - block.timestamp : 0;
        
        return (
            circle.name,
            circle.currentCycle,
            circle.totalCycles,
            circle.poolBalance,
            circle.contributionAmount,
            circle.phase,
            payoutSchedule[circle.currentCycle],
            timeLeft,
            circle.isActive && !circle.emergencyPaused,
            circle.positionsInitialized
        );
    }
    
    /**
     * @dev Get member information
     */
    function getMemberInfo(address memberAddress) external view returns (
        string memory name,
        uint256 payoutPosition,
        bool hasContributed,
        bool hasReceivedPayout,
        uint256 totalContributions,
        bool isActive
    ) {
        Member memory member = members[memberAddress];
        return (
            member.name,
            member.payoutPosition,
            member.hasContributed,
            member.hasReceivedPayout,
            member.totalContributions,
            member.isActive
        );
    }
    
    /**
     * @dev Get all members and their names
     */
    function getMembers() external view returns (address[] memory addresses, string[] memory names) {
        string[] memory memberNames = new string[](memberList.length);
        for (uint i = 0; i < memberList.length; i++) {
            memberNames[i] = members[memberList[i]].name;
        }
        return (memberList, memberNames);
    }
    
    /**
     * @dev Get payout schedule
     */
    function getPayoutSchedule() external view returns (address[] memory recipients, string[] memory names) {
        address[] memory scheduleRecipients = new address[](circle.totalCycles);
        string[] memory scheduleNames = new string[](circle.totalCycles);
        
        for (uint i = 1; i <= circle.totalCycles; i++) {
            scheduleRecipients[i-1] = payoutSchedule[i];
            if (payoutSchedule[i] != address(0)) {
                scheduleNames[i-1] = members[payoutSchedule[i]].name;
            } else {
                scheduleNames[i-1] = "Removed";
            }
        }
        
        return (scheduleRecipients, scheduleNames);
    }
    
    /**
     * @dev Get yield performance data
     */
    function getYieldPerformance() external view returns (
        string memory strategy,
        uint256 totalInvestedAmount,
        uint256 currentYield,
        uint256 totalYieldEarned,
        uint256 estimatedAPY
    ) {
        uint256 currentYieldAmount = totalInvested > 0 ? yieldManager.getCurrentYield(address(this)) : 0;
        
        uint256 calculatedAPY = 0;
        if (totalInvested > 0 && lastYieldUpdate > 0) {
            uint256 timeElapsed = block.timestamp - lastYieldUpdate;
            if (timeElapsed > 0 && currentYieldAmount > 0) {
                // Annualized yield calculation
                calculatedAPY = (currentYieldAmount * 365 days * 10000) / totalInvested / timeElapsed;
            }
        }
        
        return (
            currentStrategy,
            totalInvested,
            currentYieldAmount,
            circle.totalYieldEarned,
            calculatedAPY
        );
    }
    
    /**
     * @dev Get contribution status for current cycle
     */
    function getContributionStatus() external view returns (
        address[] memory members_,
        bool[] memory hasContributed,
        uint256 totalContributed,
        uint256 remainingAmount
    ) {
        bool[] memory contributionStatus = new bool[](memberList.length);
        uint256 contributed = 0;
        
        for (uint i = 0; i < memberList.length; i++) {
            contributionStatus[i] = members[memberList[i]].hasContributed;
            if (contributionStatus[i]) {
                contributed = contributed + 1;
            }
        }
        
        uint256 totalNeeded = circle.contributionAmount * _getActiveMemberCount();
        uint256 remaining = totalNeeded - circle.poolBalance;
        
        return (memberList, contributionStatus, contributed, remaining);
    }
    
    // ============================================================================
    // INTERNAL HELPER FUNCTIONS
    // ============================================================================
    
    function _allMembersContributed() internal view returns (bool) {
        for (uint i = 0; i < memberList.length; i++) {
            if (!members[memberList[i]].hasContributed) {
                return false;
            }
        }
        return true;
    }
    
    function _allActiveMembersContributed() internal view returns (bool) {
        for (uint i = 0; i < memberList.length; i++) {
            if (members[memberList[i]].isActive && !members[memberList[i]].hasContributed) {
                return false;
            }
        }
        return true;
    }
    
    function _getActiveMemberCount() internal view returns (uint256) {
        uint256 activeCount = 0;
        for (uint i = 0; i < memberList.length; i++) {
            if (members[memberList[i]].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }
    
    /**
     * @dev Allow contract to receive ETH for gas or other purposes
     */
    receive() external payable {}
    
    /**
     * @dev Emergency withdrawal of stuck tokens (only creator, only after completion/emergency)
     */
    function emergencyWithdrawToken(address token, uint256 amount) external onlyCreator {
        require(
            circle.phase == CirclePhase.COMPLETED || circle.emergencyPaused, 
            "Only after completion or emergency"
        );
        IERC20(token).transfer(circle.creator, amount);
    }
    
    /**
     * @dev Emergency withdrawal of ETH (only creator, only after completion/emergency)
     */
    function emergencyWithdrawETH() external onlyCreator {
        require(
            circle.phase == CirclePhase.COMPLETED || circle.emergencyPaused, 
            "Only after completion or emergency"
        );
        payable(circle.creator).transfer(address(this).balance);
    }
}
