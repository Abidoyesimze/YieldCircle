// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../interfaces/IKaiasProtocol.sol";

/**
 * @title Secure Random Number Generator
 * @dev Uses Chainlink VRF for secure randomness
 */
contract RandomGenerator is AccessControl {

    
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    IChainlinkVRF public immutable vrfCoordinator;
    bytes32 public immutable keyHash;
    uint64 public immutable subscriptionId;
    uint32 public immutable callbackGasLimit;
    uint16 public immutable requestConfirmations;
    
    struct RandomRequest {
        address requester;
        uint256 requestId;
        bool fulfilled;
        uint256[] randomWords;
        uint256 timestamp;
    }
    
    mapping(uint256 => RandomRequest) public requests;
    mapping(address => uint256[]) public userRequests;
    
    event RandomWordsRequested(uint256 indexed requestId, address indexed requester);
    event RandomWordsFulfilled(uint256 indexed requestId, uint256[] randomWords);
    
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) {
        vrfCoordinator = IChainlinkVRF(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Request random numbers for a circle
     * @param memberCount Number of members to generate positions for
     * @return requestId The request ID for tracking
     */
    function requestRandomPositions(uint256 memberCount) 
        external 
        onlyRole(OPERATOR_ROLE) 
        returns (uint256 requestId) 
    {
        require(memberCount > 0 && memberCount <= 50, "Invalid member count");
        
        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            uint32(memberCount)
        );
        
        requests[requestId] = RandomRequest({
            requester: msg.sender,
            requestId: requestId,
            fulfilled: false,
            randomWords: new uint256[](0),
            timestamp: block.timestamp
        });
        
        userRequests[msg.sender].push(requestId);
        
        emit RandomWordsRequested(requestId, msg.sender);
        return requestId;
    }
    
    /**
     * @dev Callback function called by VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) 
        external 
    {
        require(msg.sender == address(vrfCoordinator), "Only VRF coordinator");
        require(requests[requestId].requester != address(0), "Request not found");
        require(!requests[requestId].fulfilled, "Request already fulfilled");
        
        requests[requestId].fulfilled = true;
        requests[requestId].randomWords = randomWords;
        
        emit RandomWordsFulfilled(requestId, randomWords);
    }
    
    /**
     * @dev Generate shuffled positions from random words
     * @param requestId The request ID
     * @return positions Array of shuffled positions (1-based)
     */
    function generatePositions(uint256 requestId) 
        external 
        view 
        returns (uint256[] memory positions) 
    {
        RandomRequest memory request = requests[requestId];
        require(request.fulfilled, "Request not fulfilled");
        require(request.requester == msg.sender, "Not the requester");
        
        uint256 memberCount = request.randomWords.length;
        positions = new uint256[](memberCount);
        
        // Initialize sequential positions
        for (uint i = 0; i < memberCount; i++) {
            positions[i] = i + 1;
        }
        
        // Fisher-Yates shuffle using random words
        for (uint i = memberCount - 1; i > 0; i--) {
            uint256 randomIndex = request.randomWords[i] % (i + 1);
            
            // Swap positions
            uint256 temp = positions[i];
            positions[i] = positions[randomIndex];
            positions[randomIndex] = temp;
        }
        
        return positions;
    }
    
    /**
     * @dev Get request status
     */
    function getRequestStatus(uint256 requestId) 
        external 
        view 
        returns (
            address requester,
            bool fulfilled,
            uint256 timestamp,
            uint256 wordCount
        ) 
    {
        RandomRequest memory request = requests[requestId];
        return (
            request.requester,
            request.fulfilled,
            request.timestamp,
            request.randomWords.length
        );
    }
    
    /**
     * @dev Get user's request history
     */
    function getUserRequests(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userRequests[user];
    }
    
    /**
     * @dev Emergency fallback for testing (remove in production)
     */
    function generateTestPositions(uint256 memberCount) 
        external 
        view 
        onlyRole(OPERATOR_ROLE) 
        returns (uint256[] memory positions) 
    {
        require(memberCount > 0 && memberCount <= 20, "Invalid member count");
        
        positions = new uint256[](memberCount);
        
        // Initialize sequential positions
        for (uint i = 0; i < memberCount; i++) {
            positions[i] = i + 1;
        }
        
        // Simple shuffle for testing (not secure)
        for (uint i = 0; i < memberCount; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                i,
                memberCount
            ))) % memberCount;
            
            uint256 temp = positions[i];
            positions[i] = positions[randomIndex];
            positions[randomIndex] = temp;
        }
        
        return positions;
    }
}
