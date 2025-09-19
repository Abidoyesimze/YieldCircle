// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

import "./KaiaYieldStrategyManager.sol";
import "./YieldCircle.sol";
import "./libraries/RandomGenerator.sol";

/**
 * @title Simple Yield Circle Factory
 * @dev Simplified factory contract for creating yield circles
 * @author Yield Circle Team
 */
contract SimpleYieldCircleFactory is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    IERC20 public immutable USDT;
    KaiaYieldStrategyManager public yieldManager;
    RandomGenerator public randomGenerator;

    address[] public allCircles;
    mapping(address => address[]) public userCircles;
    mapping(address => uint256) public circleCount;
    mapping(address => bool) public circleExists;

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

    event SecuritySettingsUpdated(
        uint256 maxCirclesPerUser,
        uint256 maxTotalCircles
    );

    // Errors
    error InvalidMemberCount();
    error InvalidContributionAmount();
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
        require(
            _randomGenerator != address(0),
            "Invalid random generator address"
        );

        USDT = IERC20(_usdt);
        yieldManager = KaiaYieldStrategyManager(_yieldManager);
        randomGenerator = RandomGenerator(_randomGenerator);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Create a new yield circle with basic validation
     */
    function createCircle(
        address[] memory members,
        uint256 contributionAmount,
        uint256 cycleDuration,
        string memory circleName
    )
        external
        whenNotPaused
        returns (address circleAddress, uint256 requestId)
    {
        // Basic validation
        require(
            members.length >= 2 && members.length <= 20,
            "Invalid member count"
        );
        require(
            contributionAmount >= 1e6 && contributionAmount <= 10000e6,
            "Invalid contribution amount"
        );
        require(
            cycleDuration >= 1 days && cycleDuration <= 365 days,
            "Invalid duration"
        );

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
        if (circleCount[msg.sender] >= maxCirclesPerUser)
            revert TooManyCircles();
        if (allCircles.length >= maxTotalCircles) revert CircleLimitExceeded();

        // Check creation frequency
        if (
            block.timestamp <
            lastCircleCreation[msg.sender] + minCircleCreationDelay
        ) {
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

        uint256[] memory positions = randomGenerator.generatePositions(
            requestId
        );
        YieldCircle(circleAddress).initializeWithPositions(positions);
    }

    /**
     * @dev Set yield manager address
     */
    function setYieldManager(
        address _yieldManager
    ) external onlyRole(ADMIN_ROLE) {
        require(_yieldManager != address(0), "Invalid address");
        yieldManager = KaiaYieldStrategyManager(_yieldManager);
    }

    /**
     * @dev Set random generator address
     */
    function setRandomGenerator(
        address _randomGenerator
    ) external onlyRole(ADMIN_ROLE) {
        require(_randomGenerator != address(0), "Invalid address");
        randomGenerator = RandomGenerator(_randomGenerator);
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

    function getUserCircles(
        address user
    ) external view returns (address[] memory) {
        return userCircles[user];
    }

    function getCircleCreationInfo(
        address user
    )
        external
        view
        returns (
            uint256 userCircleCount,
            uint256 lastCreationTime,
            uint256 timeUntilNextAllowed
        )
    {
        uint256 nextAllowed = lastCircleCreation[user] + minCircleCreationDelay;
        uint256 timeLeft = block.timestamp < nextAllowed
            ? nextAllowed - block.timestamp
            : 0;

        return (circleCount[user], lastCircleCreation[user], timeLeft);
    }

    /**
     * @dev Check if circle creation is allowed
     */
    function canCreateCircle(address user) external view returns (bool) {
        return (circleCount[user] < maxCirclesPerUser &&
            allCircles.length < maxTotalCircles &&
            block.timestamp >=
            lastCircleCreation[user] + minCircleCreationDelay);
    }
}
