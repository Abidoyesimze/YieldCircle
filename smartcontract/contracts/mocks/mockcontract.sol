// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Simple MockERC20 without Ownable to avoid version conflicts
contract MockERC20 is ERC20 {
    uint8 private _decimals;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue
    ) ERC20(name, symbol) {
        _decimals = decimalsValue;
        owner = msg.sender;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

// Mock VRF Coordinator for testing
contract MockVRFCoordinator {
    uint256 private _requestId = 1;

    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );

    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = _requestId++;

        emit RandomWordsRequested(
            keyHash,
            requestId,
            0, // preSeed
            subId,
            minimumRequestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );

        // For testing, fulfill the request immediately
        _fulfillRandomWords(requestId, msg.sender, numWords);

        return requestId;
    }

    function _fulfillRandomWords(
        uint256 requestId,
        address consumer,
        uint32 numWords
    ) internal {
        uint256[] memory randomWords = new uint256[](numWords);

        // Generate pseudo-random numbers for testing
        for (uint32 i = 0; i < numWords; i++) {
            randomWords[i] = uint256(
                keccak256(
                    abi.encode(requestId, i, block.timestamp, block.prevrandao)
                )
            );
        }

        // Call the consumer's fulfillRandomWords function
        (bool success, ) = consumer.call(
            abi.encodeWithSignature(
                "fulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );

        require(success, "Failed to fulfill random words");
    }

    // Manual fulfill function for testing
    function fulfillRandomWords(
        uint256 requestId,
        address consumer,
        uint256[] calldata randomWords
    ) external {
        (bool success, ) = consumer.call(
            abi.encodeWithSignature(
                "fulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );

        require(success, "Failed to fulfill random words");
    }
}

// Mock LINK Token for testing
contract MockLinkToken is ERC20 {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() ERC20("ChainLink Token", "LINK") {
        owner = msg.sender;
        _mint(msg.sender, 1000000 * 10 ** 18); // Mint initial supply
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // LINK token specific functions for VRF
    function transferAndCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool success) {
        super.transfer(to, value);

        // Call the receiving contract
        (bool callSuccess, ) = to.call(data);
        require(callSuccess, "Transfer and call failed");

        return true;
    }
}
