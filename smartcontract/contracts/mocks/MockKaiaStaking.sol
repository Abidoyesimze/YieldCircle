// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IKaiaStaking.sol";

/**
 * @title MockKaiaStaking
 * @dev Mock implementation of Kaia native staking protocol for testing
 * @author Yield Circle Team
 */
contract MockKaiaStaking is IKaiaStaking, Ownable {
    IERC20 public immutable KAIA;

    // Staking parameters
    uint256 public constant MIN_STAKE_AMOUNT = 1000e18; // 1000 KAIA minimum
    uint256 public constant UNSTAKING_PERIOD = 7 days; // 7 days unstaking period
    uint256 public constant BASE_APY = 1000; // 10% base APY (1000 basis points)

    // Stake tracking
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 totalRewardsClaimed;
        bool isActive;
    }

    mapping(uint256 => StakeInfo) public stakes;
    mapping(address => uint256[]) public userStakes;
    uint256 public nextStakeId = 1;

    // Total staked amount
    uint256 public totalStaked;

    // Events
    event Staked(address indexed user, uint256 indexed stakeId, uint256 amount);
    event Unstaked(
        address indexed user,
        uint256 indexed stakeId,
        uint256 amount
    );
    event RewardsClaimed(
        address indexed user,
        uint256 indexed stakeId,
        uint256 rewards
    );

    constructor(address _kaia) Ownable(msg.sender) {
        KAIA = IERC20(_kaia);
    }

    /**
     * @dev Stake KAIA tokens for validation rewards
     */
    function stake(uint256 amount) external override returns (uint256 stakeId) {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum");
        require(
            KAIA.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        stakeId = nextStakeId++;
        stakes[stakeId] = StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            totalRewardsClaimed: 0,
            isActive: true
        });

        userStakes[msg.sender].push(stakeId);
        totalStaked += amount;

        emit Staked(msg.sender, stakeId, amount);
        return stakeId;
    }

    /**
     * @dev Unstake KAIA tokens
     */
    function unstake(
        uint256 stakeId,
        uint256 amount
    ) external override returns (uint256 actualAmount) {
        StakeInfo storage stakeInfo = stakes[stakeId];
        require(stakeInfo.isActive, "Stake not active");
        require(amount <= stakeInfo.amount, "Amount exceeds stake");

        // Claim any pending rewards first
        uint256 pendingRewards = getPendingRewards(stakeId);
        if (pendingRewards > 0) {
            claimRewards(stakeId);
        }

        actualAmount = amount;
        stakeInfo.amount -= amount;
        totalStaked -= amount;

        if (stakeInfo.amount == 0) {
            stakeInfo.isActive = false;
        }

        require(KAIA.transfer(msg.sender, actualAmount), "Transfer failed");

        emit Unstaked(msg.sender, stakeId, actualAmount);
        return actualAmount;
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards(
        uint256 stakeId
    ) public override returns (uint256 rewards) {
        StakeInfo storage stakeInfo = stakes[stakeId];
        require(stakeInfo.isActive, "Stake not active");

        rewards = getPendingRewards(stakeId);
        if (rewards > 0) {
            stakeInfo.lastClaimTime = block.timestamp;
            stakeInfo.totalRewardsClaimed += rewards;

            // Mint rewards (in real implementation, this would come from protocol)
            require(KAIA.transfer(msg.sender, rewards), "Transfer failed");

            emit RewardsClaimed(msg.sender, stakeId, rewards);
        }

        return rewards;
    }

    /**
     * @dev Get current APY for staking
     */
    function getCurrentAPY() external pure override returns (uint256 apy) {
        return BASE_APY; // 10% APY
    }

    /**
     * @dev Get total staked amount for a stake
     */
    function getStakedAmount(
        uint256 stakeId
    ) external view override returns (uint256 amount) {
        return stakes[stakeId].amount;
    }

    /**
     * @dev Get pending rewards for a stake
     */
    function getPendingRewards(
        uint256 stakeId
    ) public view override returns (uint256 rewards) {
        StakeInfo memory stakeInfo = stakes[stakeId];
        if (!stakeInfo.isActive) return 0;

        uint256 timeElapsed = block.timestamp - stakeInfo.lastClaimTime;
        uint256 annualRewards = (stakeInfo.amount * BASE_APY) / 10000; // Convert basis points
        rewards = (annualRewards * timeElapsed) / 365 days;

        return rewards;
    }

    /**
     * @dev Get minimum stake amount
     */
    function getMinStakeAmount()
        external
        pure
        override
        returns (uint256 minAmount)
    {
        return MIN_STAKE_AMOUNT;
    }

    /**
     * @dev Get unstaking period
     */
    function getUnstakingPeriod()
        external
        pure
        override
        returns (uint256 period)
    {
        return UNSTAKING_PERIOD;
    }

    /**
     * @dev Check if staking is active
     */
    function isStakingActive() external pure override returns (bool isActive) {
        return true; // Always active in mock
    }

    /**
     * @dev Get user's stake IDs
     */
    function getUserStakes(
        address user
    ) external view returns (uint256[] memory) {
        return userStakes[user];
    }

    /**
     * @dev Get stake info
     */
    function getStakeInfo(
        uint256 stakeId
    ) external view returns (StakeInfo memory) {
        return stakes[stakeId];
    }

    /**
     * @dev Update APY (admin only)
     */
    function updateAPY(uint256 newAPY) external onlyOwner {
        // In real implementation, this would update the base APY
        // For mock, we'll just emit an event
        emit RewardsClaimed(address(0), 0, newAPY);
    }
}
