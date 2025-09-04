// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "./KaiaYieldStrategyManager.sol";
import "./YieldCircle.sol";
import "./libraries/RandomGenerator.sol";

/**
 * @title Yield Circle Factory
 * @dev Factory contract for creating yield circles with enhanced security
 * @author Yield Circle Team
 */
contract YieldCircleFactory is AccessControl, Pausable {

    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    IERC20 public immutable USDT;
    KaiaYieldStrategyManager public yieldManager;
    RandomGenerator public randomGenerator;
    
    address[] public allCircles;
    mapping(address => address[]) public userCircles;
    mapping(address => uint256) public circleCount;
    mapping(address => bool) public circleExists;
    
    // Circle templates with enhanced validation
    struct CircleTemplate {
        string name;
        uint256 minMembers;
        uint256 maxMembers;
        uint256 minContribution;
        uint256 maxContribution;
        uint256[] allowedDurations; // in seconds
        bool isActive;
        uint256 maxTotalValue; // Maximum total value for this template
        uint256 gasEstimate; // Estimated gas cost for operations
    }
    
    mapping(string => CircleTemplate) public templates;
    string[] public templateNames;
    
    // Security controls
    uint256 public maxCirclesPerUser = 10;
    uint256 public maxTotalCircles = 1000;
    uint256 public minCircleCreationDelay = 1 hours;
    mapping(address => uint256) public lastCircleCreation;
    
    // Events
    event CircleCreated(
        address indexed circle,
        address indexed creator,
        string name,
        uint256 memberCount,
        uint256 contributionAmount,
        uint256 cycleDuration,
        uint256 requestId
    );
    
    event TemplateAdded(string indexed templateName, uint256 minMembers, uint256 maxMembers);
    event TemplateUpdated(string indexed templateName, bool isActive);
    event SecuritySettingsUpdated(uint256 maxCirclesPerUser, uint256 maxTotalCircles);
    
    // Errors
    error TemplateInactive();
    error InvalidMemberCount();
    error InvalidContributionAmount();
    error InvalidDuration();
    error CreatorNotInMembers();
    error DuplicateMember();
    error TooManyCircles();
    error CircleCreationTooFrequent();
    error InvalidAddress();
    error CircleLimitExceeded();
    
    constructor(
        address _usdt,
        address _yieldManager,
        address _randomGenerator
    ) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_yieldManager != address(0), "Invalid yield manager address");
        require(_randomGenerator != address(0), "Invalid random generator address");
        
        USDT = IERC20(_usdt);
        yieldManager = KaiaYieldStrategyManager(_yieldManager);
        randomGenerator = RandomGenerator(_randomGenerator);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        _initializeTemplates();
    }
    
    function _initializeTemplates() internal {
        // Family template
        uint256[] memory familyDurations = new uint256[](2);
        familyDurations[0] = 7 days;
        familyDurations[1] = 30 days;
        _addTemplate(
            "family",
            "Family Savings",
            3,
            8,
            25e6,  // $25
            1000e6, // $1000
            familyDurations,
            8000e6, // $8000 max total value
            200000 // 200k gas estimate
        );
        
        // Friends template
        uint256[] memory friendsDurations = new uint256[](1);
        friendsDurations[0] = 30 days;
        _addTemplate(
            "friends",
            "Friends Group",
            4,
            12,
            50e6,  // $50
            500e6, // $500
            friendsDurations,
            6000e6, // $6000 max total value
            250000 // 250k gas estimate
        );
        
        // Community template
        uint256[] memory communityDurations = new uint256[](3);
        communityDurations[0] = 30 days;
        communityDurations[1] = 60 days;
        communityDurations[2] = 90 days;
        _addTemplate(
            "community",
            "Community Pool",
            8,
            20,
            100e6,  // $100
            2000e6, // $2000
            communityDurations,
            40000e6, // $40000 max total value
            300000 // 300k gas estimate
        );
    }
    
    function _addTemplate(
        string memory key,
        string memory name,
        uint256 minMembers,
        uint256 maxMembers,
        uint256 minContribution,
        uint256 maxContribution,
        uint256[] memory allowedDurations,
        uint256 maxTotalValue,
        uint256 gasEstimate
    ) internal {
        templates[key] = CircleTemplate({
            name: name,
            minMembers: minMembers,
            maxMembers: maxMembers,
            minContribution: minContribution,
            maxContribution: maxContribution,
            allowedDurations: allowedDurations,
            isActive: true,
            maxTotalValue: maxTotalValue,
            gasEstimate: gasEstimate
        });
        
        templateNames.push(key);
        emit TemplateAdded(key, minMembers, maxMembers);
    }
    
    /**
     * @dev Create a new yield circle with enhanced validation
     */
    function createCircle(
        string memory templateName,
        address[] memory members,
        uint256 contributionAmount,
        uint256 cycleDuration,
        string memory circleName
    ) external whenNotPaused returns (address circleAddress, uint256 requestId) {
        // Validate template
        CircleTemplate memory template = templates[templateName];
        if (!template.isActive) revert TemplateInactive();
        
        // Validate member count
        if (members.length < template.minMembers || members.length > template.maxMembers) {
            revert InvalidMemberCount();
        }
        
        // Validate contribution amount
        if (contributionAmount < template.minContribution || contributionAmount > template.maxContribution) {
            revert InvalidContributionAmount();
        }
        
        // Validate total value
        uint256 totalValue = contributionAmount * members.length;
        if (totalValue > template.maxTotalValue) {
            revert InvalidContributionAmount();
        }
        
        // Validate duration
        if (!_isValidDuration(templateName, cycleDuration)) {
            revert InvalidDuration();
        }
        
        // Validate creator is in members list and no duplicates
        bool creatorIncluded = false;
        for (uint i = 0; i < members.length; i++) {
            if (members[i] == address(0)) revert InvalidAddress();
            if (members[i] == msg.sender) creatorIncluded = true;
            
            // Check for duplicates
            for (uint j = i + 1; j < members.length; j++) {
                if (members[i] == members[j]) revert DuplicateMember();
            }
        }
        if (!creatorIncluded) revert CreatorNotInMembers();
        
        // Check user limits
        if (circleCount[msg.sender] >= maxCirclesPerUser) revert TooManyCircles();
        if (allCircles.length >= maxTotalCircles) revert CircleLimitExceeded();
        
        // Check creation frequency
        if (block.timestamp < lastCircleCreation[msg.sender] + minCircleCreationDelay) {
            revert CircleCreationTooFrequent();
        }
        
        // Request random positions
        requestId = randomGenerator.requestRandomPositions(members.length);
        
        // Deploy new circle
        YieldCircle newCircle = new YieldCircle(
            address(USDT),
            address(yieldManager),
            address(randomGenerator),
            members,
            contributionAmount,
            cycleDuration,
            circleName,
            msg.sender,
            requestId
        );
        
        // Grant circle role to interact with yield manager
        yieldManager.grantRole(yieldManager.CIRCLE_ROLE(), address(newCircle));
        
        // Record circle
        circleAddress = address(newCircle);
        allCircles.push(circleAddress);
        circleExists[circleAddress] = true;
        
        for (uint i = 0; i < members.length; i++) {
            userCircles[members[i]].push(circleAddress);
        }
        
        circleCount[msg.sender]++;
        lastCircleCreation[msg.sender] = block.timestamp;
        
        emit CircleCreated(
            circleAddress,
            msg.sender,
            circleName,
            members.length,
            contributionAmount,
            cycleDuration,
            requestId
        );
        
        return (circleAddress, requestId);
    }
    
    /**
     * @dev Initialize circle with random positions after VRF callback
     */
    function initializeCircleWithPositions(
        address payable circleAddress,
        uint256 requestId
    ) external onlyRole(OPERATOR_ROLE) {
        require(circleExists[circleAddress], "Circle does not exist");
        
        uint256[] memory positions = randomGenerator.generatePositions(requestId);
        YieldCircle(circleAddress).initializeWithPositions(positions);
    }
    
    function _isValidDuration(string memory templateName, uint256 duration) internal view returns (bool) {
        uint256[] memory allowedDurations = templates[templateName].allowedDurations;
        for (uint i = 0; i < allowedDurations.length; i++) {
            if (allowedDurations[i] == duration) return true;
        }
        return false;
    }
    
    /**
     * @dev Set yield manager address
     */
    function setYieldManager(address _yieldManager) external onlyRole(ADMIN_ROLE) {
        require(_yieldManager != address(0), "Invalid address");
        yieldManager = KaiaYieldStrategyManager(_yieldManager);
    }
    
    /**
     * @dev Set random generator address
     */
    function setRandomGenerator(address _randomGenerator) external onlyRole(ADMIN_ROLE) {
        require(_randomGenerator != address(0), "Invalid address");
        randomGenerator = RandomGenerator(_randomGenerator);
    }
    
    /**
     * @dev Add new template
     */
    function addTemplate(
        string memory key,
        string memory name,
        uint256 minMembers,
        uint256 maxMembers,
        uint256 minContribution,
        uint256 maxContribution,
        uint256[] memory allowedDurations,
        uint256 maxTotalValue,
        uint256 gasEstimate
    ) external onlyRole(ADMIN_ROLE) {
        require(bytes(templates[key].name).length == 0, "Template already exists");
        require(minMembers > 0 && maxMembers >= minMembers, "Invalid member range");
        require(minContribution > 0 && maxContribution >= minContribution, "Invalid contribution range");
        require(allowedDurations.length > 0, "No durations provided");
        
        _addTemplate(key, name, minMembers, maxMembers, minContribution, maxContribution, allowedDurations, maxTotalValue, gasEstimate);
    }
    
    /**
     * @dev Update template status
     */
    function updateTemplateStatus(string memory templateName, bool isActive) 
        external onlyRole(ADMIN_ROLE) {
        require(bytes(templates[templateName].name).length > 0, "Template not found");
        templates[templateName].isActive = isActive;
        emit TemplateUpdated(templateName, isActive);
    }
    
    /**
     * @dev Update security settings
     */
    function updateSecuritySettings(
        uint256 _maxCirclesPerUser,
        uint256 _maxTotalCircles,
        uint256 _minCircleCreationDelay
    ) external onlyRole(ADMIN_ROLE) {
        maxCirclesPerUser = _maxCirclesPerUser;
        maxTotalCircles = _maxTotalCircles;
        minCircleCreationDelay = _minCircleCreationDelay;
        emit SecuritySettingsUpdated(_maxCirclesPerUser, _maxTotalCircles);
    }
    
    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Resume after emergency
     */
    function emergencyResume() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // View functions
    function getCircleCount() external view returns (uint256) {
        return allCircles.length;
    }
    
    function getUserCircles(address user) external view returns (address[] memory) {
        return userCircles[user];
    }
    
    function getTemplateInfo(string memory templateName) external view returns (
        uint256 minMembers,
        uint256 maxMembers,
        uint256 minContribution,
        uint256 maxContribution,
        uint256[] memory allowedDurations,
        bool isActive,
        uint256 maxTotalValue,
        uint256 gasEstimate
    ) {
        CircleTemplate memory template = templates[templateName];
        return (
            template.minMembers,
            template.maxMembers,
            template.minContribution,
            template.maxContribution,
            template.allowedDurations,
            template.isActive,
            template.maxTotalValue,
            template.gasEstimate
        );
    }
    
    function getTemplateNames() external view returns (string[] memory) {
        return templateNames;
    }
    
    function getCircleCreationInfo(address user) external view returns (
        uint256 userCircleCount,
        uint256 lastCreationTime,
        uint256 timeUntilNextAllowed
    ) {
        uint256 nextAllowed = lastCircleCreation[user] + minCircleCreationDelay;
        uint256 timeLeft = block.timestamp < nextAllowed ? nextAllowed - block.timestamp : 0;
        
        return (circleCount[user], lastCircleCreation[user], timeLeft);
    }
    
    /**
     * @dev Check if circle creation is allowed
     */
    function canCreateCircle(address user) external view returns (bool) {
        return (
            circleCount[user] < maxCirclesPerUser &&
            allCircles.length < maxTotalCircles &&
            block.timestamp >= lastCircleCreation[user] + minCircleCreationDelay
        );
    }
}
