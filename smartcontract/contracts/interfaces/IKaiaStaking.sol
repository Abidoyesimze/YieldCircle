// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IKaiaStaking Interface
 * @dev Interface for Kaia native staking protocol
 * @author Yield Circle Team
 */
interface IKaiaStaking {
    /**
     * @dev Stake KAIA tokens for validation rewards
     * @param amount Amount of KAIA tokens to stake
     * @return stakeId Unique identifier for the stake
     */
    function stake(uint256 amount) external returns (uint256 stakeId);

    /**
     * @dev Unstake KAIA tokens
     * @param stakeId Unique identifier for the stake
     * @param amount Amount of KAIA tokens to unstake
     * @return actualAmount Actual amount unstaked
     */
    function unstake(
        uint256 stakeId,
        uint256 amount
    ) external returns (uint256 actualAmount);

    /**
     * @dev Claim staking rewards
     * @param stakeId Unique identifier for the stake
     * @return rewards Amount of rewards claimed
     */
    function claimRewards(uint256 stakeId) external returns (uint256 rewards);

    /**
     * @dev Get current APY for staking
     * @return apy Current APY in basis points (1000 = 10%)
     */
    function getCurrentAPY() external view returns (uint256 apy);

    /**
     * @dev Get total staked amount for a stake
     * @param stakeId Unique identifier for the stake
     * @return amount Total staked amount
     */
    function getStakedAmount(
        uint256 stakeId
    ) external view returns (uint256 amount);

    /**
     * @dev Get pending rewards for a stake
     * @param stakeId Unique identifier for the stake
     * @return rewards Pending rewards amount
     */
    function getPendingRewards(
        uint256 stakeId
    ) external view returns (uint256 rewards);

    /**
     * @dev Get minimum stake amount
     * @return minAmount Minimum amount required to stake
     */
    function getMinStakeAmount() external view returns (uint256 minAmount);

    /**
     * @dev Get unstaking period
     * @return period Time required for unstaking in seconds
     */
    function getUnstakingPeriod() external view returns (uint256 period);

    /**
     * @dev Check if staking is active
     * @return isActive True if staking is currently active
     */
    function isStakingActive() external view returns (bool isActive);
}
