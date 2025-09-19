// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// Import mock contracts
import "./mocks/MockLending.sol";
import "./mocks/MockRouter.sol";
import "./mocks/MockKaiaStaking.sol";

/**
 * @title Kaia Yield Strategy Manager - Integrated with Mock Protocols
 * @dev Manages DeFi yield strategies with working mock protocols for testnet
 * @author Yield Circle Team
 */
contract KaiaYieldStrategyManager is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant STRATEGY_MANAGER_ROLE =
        keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant CIRCLE_ROLE = keccak256("CIRCLE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    IERC20 public immutable USDT;
    IERC20 public immutable KAIA;

    // Protocol contract references
    MockRouter public dexRouter;
    MockLending public lendingProtocol;
    MockKaiaStaking public stakingContract;

    // Protocol addresses for compatibility
    address public kaiaRouter;
    address public kaiaLending;
    address public kaiaStaking;

    // Slippage protection (basis points)
    uint256 public constant MAX_SLIPPAGE = 500; // 5%
    uint256 public constant DEFAULT_SLIPPAGE = 200; // 2%

    struct StrategyInfo {
        string name;
        address contractAddress;
        uint256 currentAPY; // Basis points (500 = 5%)
        uint256 riskScore; // 1-10 (1=lowest risk)
        uint256 liquidityScore; // 1-10 (10=most liquid)
        uint256 minAmount; // Minimum investment
        uint256 totalInvested; // Total amount across all circles
        bool isActive;
        StrategyType strategyType;
        uint256 lastAPYUpdate; // Timestamp of last APY update
        uint256 actualYieldEarned; // Actual yield earned (not estimated)
    }

    enum StrategyType {
        TREASURY, // 0% yield, maximum safety
        LENDING, // Single asset lending
        LP_STABLE, // USDT/KAIA LP
        NATIVE_STAKING // Kaia native staking
    }

    struct CircleInvestment {
        string strategyName;
        uint256 principalAmount;
        uint256 sharesOrTokens; // LP tokens, lending shares, or stake amount
        uint256 investmentTime;
        uint256 lastYieldUpdate;
        uint256 actualYieldEarned; // Actual yield earned
        address strategyContract; // Strategy contract address
        uint256 stakeId; // For staking strategies
    }

    // Storage
    mapping(string => StrategyInfo) public strategies;
    mapping(address => CircleInvestment) public circleInvestments;
    mapping(string => address[]) public strategyCircles; // strategy => circles using it

    // Emergency controls
    bool public emergencyMode;
    mapping(address => bool) public emergencyWithdrawals;

    // Events
    event StrategyAdded(
        string indexed name,
        address contractAddress,
        StrategyType strategyType
    );
    event InvestmentExecuted(
        address indexed circle,
        string indexed strategy,
        uint256 amount
    );
    event WithdrawalExecuted(
        address indexed circle,
        uint256 requested,
        uint256 returned
    );
    event YieldHarvested(address indexed circle, uint256 yieldAmount);
    event StrategyAPYUpdated(string indexed strategy, uint256 newAPY);
    event EmergencyModeActivated(string reason);
    event ProtocolsDeployed(address dex, address lending, address staking);

    // Errors
    error InsufficientLiquidity();
    error SlippageExceeded();
    error StrategyInactive();
    error InvalidAmount();
    error EmergencyModeActive();

    constructor(address _usdt, address _kaia) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_kaia != address(0), "Invalid KAIA address");

        USDT = IERC20(_usdt);
        KAIA = IERC20(_kaia);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STRATEGY_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);

        // Deploy mock protocols
        _deployMockProtocols();
        _initializeStrategies();
    }

    function _deployMockProtocols() internal {
        // Deploy mock DEX
        dexRouter = new MockRouter();
        kaiaRouter = address(dexRouter);

        // Deploy mock lending protocol
        lendingProtocol = new MockLending();
        kaiaLending = address(lendingProtocol);

        // Deploy mock staking contract
        stakingContract = new MockKaiaStaking(address(KAIA));
        kaiaStaking = address(stakingContract);

        // Set up DEX pair for USDT/KAIA if it doesn't exist
        if (dexRouter.getPair(address(USDT), address(KAIA)) == address(0)) {
            dexRouter.createPair(address(USDT), address(KAIA));
        }

        // Set competitive APYs
        lendingProtocol.setSupplyAPY(address(USDT), 600); // 6% APY for USDT lending
        address usdtKaiaPair = dexRouter.getPair(address(USDT), address(KAIA));
        if (usdtKaiaPair != address(0)) {
            dexRouter.setLPAPY(usdtKaiaPair, 800); // 8% APY for LP tokens
        }

        emit ProtocolsDeployed(
            address(dexRouter),
            address(lendingProtocol),
            address(stakingContract)
        );
    }

    function _initializeStrategies() internal {
        // Strategy 1: Treasury (Safe)
        strategies["treasury"] = StrategyInfo({
            name: "Treasury Reserve",
            contractAddress: address(0),
            currentAPY: 0,
            riskScore: 1,
            liquidityScore: 10,
            minAmount: 0,
            totalInvested: 0,
            isActive: true,
            strategyType: StrategyType.TREASURY,
            lastAPYUpdate: block.timestamp,
            actualYieldEarned: 0
        });

        // Strategy 2: USDT Lending (Conservative)
        strategies["lending"] = StrategyInfo({
            name: "USDT Lending Pool",
            contractAddress: address(lendingProtocol),
            currentAPY: 600, // 6% APY
            riskScore: 3,
            liquidityScore: 9,
            minAmount: 25e6, // $25 minimum
            totalInvested: 0,
            isActive: true,
            strategyType: StrategyType.LENDING,
            lastAPYUpdate: block.timestamp,
            actualYieldEarned: 0
        });

        // Strategy 3: USDT/KAIA LP (Medium Risk)
        address lpToken = dexRouter.getPair(address(USDT), address(KAIA));
        strategies["usdt_kaia_lp"] = StrategyInfo({
            name: "USDT/KAIA Liquidity Pool",
            contractAddress: lpToken,
            currentAPY: 800, // 8% APY
            riskScore: 5,
            liquidityScore: 7,
            minAmount: 50e6, // $50 minimum
            totalInvested: 0,
            isActive: true,
            strategyType: StrategyType.LP_STABLE,
            lastAPYUpdate: block.timestamp,
            actualYieldEarned: 0
        });

        // Strategy 4: Kaia Native Staking
        strategies["native_staking"] = StrategyInfo({
            name: "Kaia Native Staking",
            contractAddress: address(stakingContract),
            currentAPY: 1000, // 10% APY
            riskScore: 2,
            liquidityScore: 6,
            minAmount: 1000e18, // 1000 KAIA minimum
            totalInvested: 0,
            isActive: true,
            strategyType: StrategyType.NATIVE_STAKING,
            lastAPYUpdate: block.timestamp,
            actualYieldEarned: 0
        });
    }

    /**
     * @dev Enhanced AI strategy selection with working mock protocols
     */
    function selectBestStrategy(
        address circleAddress,
        uint256 amount,
        uint256 timeHorizon, // seconds until payout needed
        uint256 riskTolerance // 1-10 scale
    )
        external
        view
        returns (string memory strategyName, string memory explanation)
    {
        if (emergencyMode) {
            return (
                "treasury",
                "Emergency mode active - keeping funds in treasury"
            );
        }

        // Rule 1: Very short timeframe = Treasury
        if (timeHorizon < 3 days) {
            return (
                "treasury",
                "Short timeframe - keeping funds liquid for payout in less than 3 days"
            );
        }

        // Rule 2: Small amounts
        if (amount < 25e6) {
            return (
                "treasury",
                "Amount below $25 minimum - keeping liquid to avoid high gas costs"
            );
        }

        // Rule 3: Conservative approach (risk 1-4)
        if (riskTolerance <= 4) {
            if (
                strategies["lending"].isActive &&
                amount >= strategies["lending"].minAmount
            ) {
                return (
                    "lending",
                    "Conservative: USDT lending for steady 6% yield with high safety and liquidity"
                );
            }
            return (
                "treasury",
                "Ultra-conservative: Keeping funds secure in treasury"
            );
        }

        // Rule 4: Moderate risk (5-7)
        if (riskTolerance >= 5 && riskTolerance <= 7) {
            if (
                strategies["usdt_kaia_lp"].isActive &&
                amount >= strategies["usdt_kaia_lp"].minAmount &&
                timeHorizon >= 7 days
            ) {
                return (
                    "usdt_kaia_lp",
                    "Balanced: USDT/KAIA LP for 8% APY with moderate risk over 7+ days"
                );
            }
            if (strategies["lending"].isActive) {
                return (
                    "lending",
                    "Moderate-conservative: USDT lending for reliable 6% returns"
                );
            }
        }

        // Rule 5: Aggressive (8-10)
        if (riskTolerance >= 8) {
            // Check if we can convert USDT to KAIA for staking
            if (
                strategies["native_staking"].isActive &&
                timeHorizon >= 30 days &&
                amount >= 100e6
            ) {
                // Need substantial amount for KAIA conversion
                return (
                    "native_staking",
                    "Aggressive: Converting USDT to KAIA for 10% staking rewards"
                );
            }

            if (
                strategies["usdt_kaia_lp"].isActive &&
                amount >= strategies["usdt_kaia_lp"].minAmount
            ) {
                return (
                    "usdt_kaia_lp",
                    "Aggressive yield: USDT/KAIA LP for maximum 8% returns"
                );
            }
        }

        // Default fallback
        return (
            "treasury",
            "Safe default: Treasury reserve optimized for upcoming payout"
        );
    }

    /**
     * @dev Execute investment with real mock protocol integration
     */
    function investInStrategy(
        address circleAddress,
        uint256 amount,
        string memory strategyName
    )
        external
        onlyRole(CIRCLE_ROLE)
        nonReentrant
        whenNotPaused
        returns (uint256 shares)
    {
        if (emergencyMode) revert EmergencyModeActive();
        if (amount == 0) revert InvalidAmount();

        StrategyInfo storage strategy = strategies[strategyName];
        if (!strategy.isActive) revert StrategyInactive();
        if (amount < strategy.minAmount) revert InvalidAmount();

        // Transfer USDT from circle
        require(
            USDT.transferFrom(circleAddress, address(this), amount),
            "Transfer failed"
        );

        uint256 sharesReceived = 0;
        address strategyContract = address(0);
        uint256 stakeId = 0;

        if (strategy.strategyType == StrategyType.TREASURY) {
            sharesReceived = amount; // 1:1 for treasury
            strategyContract = address(this);
        } else if (strategy.strategyType == StrategyType.LENDING) {
            (sharesReceived, strategyContract) = _executeLendingStrategy(
                amount
            );
        } else if (strategy.strategyType == StrategyType.LP_STABLE) {
            (sharesReceived, strategyContract) = _executeLPStrategy(amount);
        } else if (strategy.strategyType == StrategyType.NATIVE_STAKING) {
            (
                sharesReceived,
                strategyContract,
                stakeId
            ) = _executeStakingStrategy(amount);
        }

        // Record investment
        circleInvestments[circleAddress] = CircleInvestment({
            strategyName: strategyName,
            principalAmount: amount,
            sharesOrTokens: sharesReceived,
            investmentTime: block.timestamp,
            lastYieldUpdate: block.timestamp,
            actualYieldEarned: 0,
            strategyContract: strategyContract,
            stakeId: stakeId
        });

        // Update strategy totals
        strategy.totalInvested += amount;
        strategyCircles[strategyName].push(circleAddress);

        emit InvestmentExecuted(circleAddress, strategyName, amount);
        return sharesReceived;
    }

    function _executeLendingStrategy(
        uint256 amount
    ) internal returns (uint256 shares, address contractAddr) {
        // Approve and supply to lending protocol
        USDT.approve(address(lendingProtocol), amount);
        lendingProtocol.supply(address(USDT), amount);

        return (amount, address(lendingProtocol)); // Return principal as shares
    }

    function _executeLPStrategy(
        uint256 amount
    ) internal returns (uint256 shares, address lpToken) {
        uint256 halfAmount = amount / 2;

        // Swap half USDT for KAIA
        address[] memory path = new address[](2);
        path[0] = address(USDT);
        path[1] = address(KAIA);

        USDT.approve(address(dexRouter), halfAmount);
        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            halfAmount,
            0, // Accept any amount of KAIA
            path,
            address(this),
            block.timestamp + 300
        );

        uint256 kaiaReceived = amounts[1];
        uint256 remainingUsdt = halfAmount;

        // Add liquidity
        USDT.approve(address(dexRouter), remainingUsdt);
        KAIA.approve(address(dexRouter), kaiaReceived);

        (, , uint256 liquidity) = dexRouter.addLiquidity(
            address(USDT),
            address(KAIA),
            remainingUsdt,
            kaiaReceived,
            0,
            0, // Accept any amounts
            address(this),
            block.timestamp + 300
        );

        lpToken = dexRouter.getPair(address(USDT), address(KAIA));
        return (liquidity, lpToken);
    }

    function _executeStakingStrategy(
        uint256 usdtAmount
    ) internal returns (uint256 shares, address contractAddr, uint256 stakeId) {
        // Convert USDT to KAIA first
        address[] memory path = new address[](2);
        path[0] = address(USDT);
        path[1] = address(KAIA);

        USDT.approve(address(dexRouter), usdtAmount);
        uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
            usdtAmount,
            0, // Accept any amount of KAIA
            path,
            address(this),
            block.timestamp + 300
        );

        uint256 kaiaReceived = amounts[1];

        // Check minimum staking amount
        if (kaiaReceived < stakingContract.getMinStakeAmount()) {
            // Fallback to treasury if insufficient KAIA
            return (usdtAmount, address(this), 0);
        }

        // Stake KAIA
        KAIA.approve(address(stakingContract), kaiaReceived);
        stakeId = stakingContract.stake(kaiaReceived);

        return (kaiaReceived, address(stakingContract), stakeId);
    }

    /**
     * @dev Withdraw from strategy with proper yield calculation
     */
    function withdrawFromStrategy(
        address circleAddress,
        uint256 usdtAmountNeeded
    )
        external
        onlyRole(CIRCLE_ROLE)
        nonReentrant
        whenNotPaused
        returns (uint256 usdtReturned)
    {
        CircleInvestment storage investment = circleInvestments[circleAddress];
        require(
            bytes(investment.strategyName).length > 0,
            "No active investment"
        );

        StrategyInfo storage strategy = strategies[investment.strategyName];

        if (strategy.strategyType == StrategyType.TREASURY) {
            // Treasury: Direct USDT transfer
            uint256 available = USDT.balanceOf(address(this));
            uint256 toReturn = usdtAmountNeeded > available
                ? available
                : usdtAmountNeeded;
            if (toReturn > 0) {
                USDT.transfer(circleAddress, toReturn);
            }
            return toReturn;
        } else if (strategy.strategyType == StrategyType.LENDING) {
            return _withdrawFromLending(circleAddress, usdtAmountNeeded);
        } else if (strategy.strategyType == StrategyType.LP_STABLE) {
            return _withdrawFromLP(circleAddress, usdtAmountNeeded);
        } else if (strategy.strategyType == StrategyType.NATIVE_STAKING) {
            return _withdrawFromStaking(circleAddress, usdtAmountNeeded);
        }

        return 0;
    }

    function _withdrawFromLending(
        address circleAddress,
        uint256 usdtNeeded
    ) internal returns (uint256) {
        CircleInvestment storage investment = circleInvestments[circleAddress];

        // Get current balance including yield
        (uint256 principal, uint256 interest, uint256 total) = lendingProtocol
            .getSupplyBalance(address(this), address(USDT));

        uint256 toWithdraw = usdtNeeded > total ? total : usdtNeeded;
        if (toWithdraw > 0) {
            uint256 withdrawn = lendingProtocol.withdraw(
                address(USDT),
                toWithdraw
            );

            // Update investment tracking
            if (withdrawn > investment.principalAmount) {
                investment.actualYieldEarned += (withdrawn -
                    investment.principalAmount);
            }

            USDT.transfer(circleAddress, withdrawn);
            return withdrawn;
        }

        return 0;
    }

    function _withdrawFromLP(
        address circleAddress,
        uint256 usdtNeeded
    ) internal returns (uint256) {
        CircleInvestment storage investment = circleInvestments[circleAddress];
        address lpToken = investment.strategyContract;

        if (lpToken == address(0)) return 0;

        // Claim LP yield first
        uint256 lpYield = dexRouter.getLPYield(address(this), lpToken);
        if (lpYield > 0) {
            dexRouter.claimLPYield(lpToken);
            investment.actualYieldEarned += lpYield;
        }

        // Remove liquidity
        uint256 lpBalance = IERC20(lpToken).balanceOf(address(this));
        if (lpBalance > 0) {
            IERC20(lpToken).approve(address(dexRouter), lpBalance);

            (uint256 amountA, uint256 amountB) = dexRouter.removeLiquidity(
                address(USDT),
                address(KAIA),
                lpBalance,
                0,
                0, // Accept any amounts
                address(this),
                block.timestamp + 300
            );

            // Convert KAIA back to USDT if needed
            if (amountB > 0) {
                address[] memory path = new address[](2);
                path[0] = address(KAIA);
                path[1] = address(USDT);

                KAIA.approve(address(dexRouter), amountB);
                uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
                    amountB,
                    0,
                    path,
                    address(this),
                    block.timestamp + 300
                );
                amountA += amounts[1];
            }

            uint256 toReturn = usdtNeeded > amountA ? amountA : usdtNeeded;
            if (toReturn > 0) {
                USDT.transfer(circleAddress, toReturn);
            }
            return toReturn;
        }

        return 0;
    }

    function _withdrawFromStaking(
        address circleAddress,
        uint256 usdtNeeded
    ) internal returns (uint256) {
        CircleInvestment storage investment = circleInvestments[circleAddress];

        if (investment.stakeId == 0) return 0;

        // Claim rewards first
        uint256 rewards = stakingContract.claimRewards(investment.stakeId);
        if (rewards > 0) {
            investment.actualYieldEarned += rewards;
        }

        // Unstake KAIA
        uint256 stakedAmount = stakingContract.getStakedAmount(
            investment.stakeId
        );
        if (stakedAmount > 0) {
            uint256 unstaked = stakingContract.unstake(
                investment.stakeId,
                stakedAmount
            );

            // Convert KAIA back to USDT
            if (unstaked > 0) {
                address[] memory path = new address[](2);
                path[0] = address(KAIA);
                path[1] = address(USDT);

                KAIA.approve(address(dexRouter), unstaked + rewards);
                uint256[] memory amounts = dexRouter.swapExactTokensForTokens(
                    unstaked + rewards,
                    0,
                    path,
                    address(this),
                    block.timestamp + 300
                );

                uint256 usdtReceived = amounts[1];
                uint256 toReturn = usdtNeeded > usdtReceived
                    ? usdtReceived
                    : usdtNeeded;

                if (toReturn > 0) {
                    USDT.transfer(circleAddress, toReturn);
                }
                return toReturn;
            }
        }

        return 0;
    }

    /**
     * @dev Get current yield with real protocol integration
     */
    function getCurrentYield(
        address circleAddress
    ) external view returns (uint256 yieldEarned) {
        CircleInvestment memory investment = circleInvestments[circleAddress];
        if (bytes(investment.strategyName).length == 0) return 0;

        StrategyInfo memory strategy = strategies[investment.strategyName];

        if (strategy.strategyType == StrategyType.TREASURY) {
            return 0; // Treasury has no yield
        } else if (strategy.strategyType == StrategyType.LENDING) {
            (, uint256 interest, ) = lendingProtocol.getSupplyBalance(
                address(this),
                address(USDT)
            );
            return investment.actualYieldEarned + interest;
        } else if (strategy.strategyType == StrategyType.LP_STABLE) {
            uint256 lpYield = dexRouter.getLPYield(
                address(this),
                investment.strategyContract
            );
            return investment.actualYieldEarned + lpYield;
        } else if (strategy.strategyType == StrategyType.NATIVE_STAKING) {
            if (investment.stakeId > 0) {
                uint256 pendingRewards = stakingContract.getPendingRewards(
                    investment.stakeId
                );
                return investment.actualYieldEarned + pendingRewards;
            }
        }

        return investment.actualYieldEarned;
    }

    /**
     * @dev Get available strategies with current APYs
     */
    function getAvailableStrategies()
        external
        view
        returns (
            string[] memory names,
            uint256[] memory apys,
            uint256[] memory riskScores,
            uint256[] memory minAmounts,
            bool[] memory isActive
        )
    {
        names = new string[](4);
        apys = new uint256[](4);
        riskScores = new uint256[](4);
        minAmounts = new uint256[](4);
        isActive = new bool[](4);

        names[0] = "treasury";
        apys[0] = strategies["treasury"].currentAPY;
        riskScores[0] = strategies["treasury"].riskScore;
        minAmounts[0] = strategies["treasury"].minAmount;
        isActive[0] = strategies["treasury"].isActive;

        names[1] = "lending";
        apys[1] = strategies["lending"].currentAPY;
        riskScores[1] = strategies["lending"].riskScore;
        minAmounts[1] = strategies["lending"].minAmount;
        isActive[1] = strategies["lending"].isActive;

        names[2] = "usdt_kaia_lp";
        apys[2] = strategies["usdt_kaia_lp"].currentAPY;
        riskScores[2] = strategies["usdt_kaia_lp"].riskScore;
        minAmounts[2] = strategies["usdt_kaia_lp"].minAmount;
        isActive[2] = strategies["usdt_kaia_lp"].isActive;

        names[3] = "native_staking";
        apys[3] = strategies["native_staking"].currentAPY;
        riskScores[3] = strategies["native_staking"].riskScore;
        minAmounts[3] = strategies["native_staking"].minAmount;
        isActive[3] = strategies["native_staking"].isActive;

        return (names, apys, riskScores, minAmounts, isActive);
    }

    // Admin functions
    function updateStrategyAPY(
        string memory strategyName,
        uint256 newAPY
    ) external onlyRole(STRATEGY_MANAGER_ROLE) {
        require(strategies[strategyName].isActive, "Strategy not found");
        strategies[strategyName].currentAPY = newAPY;
        strategies[strategyName].lastAPYUpdate = block.timestamp;
        emit StrategyAPYUpdated(strategyName, newAPY);
    }

    function activateEmergencyMode(
        string memory reason
    ) external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated(reason);
    }

    function deactivateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = false;
        _unpause();
    }

    // Get protocol addresses for frontend integration
    function getProtocolAddresses()
        external
        view
        returns (address dex, address lending, address staking)
    {
        return (
            address(dexRouter),
            address(lendingProtocol),
            address(stakingContract)
        );
    }
}
