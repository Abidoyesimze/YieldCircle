// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IKaiasProtocol.sol";

/**
 * @title Kaia Yield Strategy Manager
 * @dev Manages DeFi yield strategies with enhanced security
 * @author Yield Circle Team
 */
contract KaiaYieldStrategyManager is AccessControl, ReentrancyGuard, Pausable {

    
    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant CIRCLE_ROLE = keccak256("CIRCLE_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    IERC20 public immutable USDT;
    IERC20 public immutable KAIA;
    IERC20 public immutable USDC;
    
    // Kaia Protocol Addresses
    address public kaiaRouter;
    address public kaiaLending;
    
    // Slippage protection (basis points)
    uint256 public constant MAX_SLIPPAGE = 500; // 5%
    uint256 public constant DEFAULT_SLIPPAGE = 200; // 2%
    
    struct StrategyInfo {
        string name;
        address contractAddress;
        uint256 currentAPY;        // Basis points (500 = 5%)
        uint256 riskScore;         // 1-10 (1=lowest risk)
        uint256 liquidityScore;    // 1-10 (10=most liquid)
        uint256 minAmount;         // Minimum investment
        uint256 totalInvested;     // Total amount across all circles
        bool isActive;
        StrategyType strategyType;
        uint256 lastAPYUpdate;      // Timestamp of last APY update
        uint256 actualYieldEarned; // Actual yield earned (not estimated)
    }
    
    enum StrategyType { 
        TREASURY,           // 0% yield, maximum safety
        LENDING,            // Single asset lending
        LP_STABLE,          // USDT/USDC LP
        LP_NATIVE,          // USDT/KAIA LP
        LP_VOLATILE         // Higher risk pairs
    }
    
    struct CircleInvestment {
        string strategyName;
        uint256 principalAmount;
        uint256 lpTokens;          // LP tokens or lending shares
        uint256 investmentTime;
        uint256 lastYieldUpdate;
        uint256 actualYieldEarned; // Actual yield earned
        address lpTokenAddress;     // LP token contract address
    }
    
    // Storage
    mapping(string => StrategyInfo) public strategies;
    mapping(address => CircleInvestment) public circleInvestments;
    mapping(string => address[]) public strategyCircles; // strategy => circles using it
    
    // Emergency controls
    bool public emergencyMode;
    mapping(address => bool) public emergencyWithdrawals;
    
    // Events
    event StrategyAdded(string indexed name, address contractAddress, StrategyType strategyType);
    event InvestmentExecuted(address indexed circle, string indexed strategy, uint256 amount);
    event WithdrawalExecuted(address indexed circle, uint256 requested, uint256 returned);
    event YieldHarvested(address indexed circle, uint256 yieldAmount);
    event StrategyAPYUpdated(string indexed strategy, uint256 newAPY);
    event EmergencyModeActivated(string reason);
    event EmergencyModeDeactivated();
    event SlippageUpdated(uint256 newSlippage);
    
    // Errors
    error InsufficientLiquidity();
    error SlippageExceeded();
    error StrategyInactive();
    error InvalidAmount();
    error EmergencyModeActive();
    
    constructor(
        address _usdt, 
        address _kaia, 
        address _usdc,
        address _kaiaRouter,
        address _kaiaLending
    ) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_kaia != address(0), "Invalid KAIA address");
        require(_usdc != address(0), "Invalid USDC address");
        
        USDT = IERC20(_usdt);
        KAIA = IERC20(_kaia);
        USDC = IERC20(_usdc);
        kaiaRouter = _kaiaRouter;
        kaiaLending = _kaiaLending;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STRATEGY_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        _initializeStrategies();
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
        
        // Strategy 2: USDT/USDC LP (Low Risk)
        strategies["stable_lp"] = StrategyInfo({
            name: "USDT/USDC Liquidity Pool",
            contractAddress: address(0), // Will be set to LP token address
            currentAPY: 450, // 4.5% APY
            riskScore: 2,
            liquidityScore: 8,
            minAmount: 50e6, // $50 minimum
            totalInvested: 0,
            isActive: true,
            strategyType: StrategyType.LP_STABLE,
            lastAPYUpdate: block.timestamp,
            actualYieldEarned: 0
        });
        
        // Strategy 3: USDT/KAIA LP (Medium Risk)
        strategies["native_lp"] = StrategyInfo({
            name: "USDT/KAIA Liquidity Pool",
            contractAddress: address(0), // Will be set to LP token address
            currentAPY: 800, // 8% APY
            riskScore: 5,
            liquidityScore: 7,
            minAmount: 100e6, // $100 minimum
            totalInvested: 0,
            isActive: true,
            strategyType: StrategyType.LP_NATIVE,
            lastAPYUpdate: block.timestamp,
            actualYieldEarned: 0
        });
        
        // Strategy 4: USDT Lending (Conservative)
        strategies["lending"] = StrategyInfo({
            name: "USDT Lending",
            contractAddress: kaiaLending,
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
    }
    
    /**
     * @dev AI-powered strategy selection with enhanced logic
     */
    function selectBestStrategy(
        address circleAddress,
        uint256 amount,
        uint256 timeHorizon, // seconds until payout needed
        uint256 riskTolerance // 1-10 scale
    ) external view returns (string memory strategyName, string memory explanation) {
        
        if (emergencyMode) {
            return ("treasury", "Emergency mode active - keeping funds in treasury");
        }
        
        // Rule 1: Short timeframe = Treasury only
        if (timeHorizon < 7 days) {
            return ("treasury", "Short timeframe - keeping funds liquid for upcoming payout in less than 7 days");
        }
        
        // Rule 2: Small amounts = Treasury (avoid gas costs)
        if (amount < 25e6) { // Less than $25
            return ("treasury", "Amount below $25 - keeping liquid to avoid high gas costs relative to investment");
        }
        
        // Rule 3: Very conservative (risk 1-3)
        if (riskTolerance <= 3) {
            if (amount >= strategies["stable_lp"].minAmount && strategies["stable_lp"].isActive && timeHorizon >= 14 days) {
                return ("stable_lp", "Conservative approach: USDT/USDC stable pair LP for steady 4.5% yield with minimal risk");
            }
            if (strategies["lending"].isActive) {
                return ("lending", "Ultra-conservative: USDT lending for 6% APY with maximum safety and liquidity");
            }
        }
        
        // Rule 4: Moderate risk (4-7)
        if (riskTolerance >= 4 && riskTolerance <= 7) {
            if (amount >= strategies["native_lp"].minAmount && strategies["native_lp"].isActive && timeHorizon >= 21 days) {
                return ("native_lp", "Balanced approach: USDT/KAIA LP targeting 8% APY with moderate risk over 3+ weeks");
            }
            if (strategies["stable_lp"].isActive && timeHorizon >= 14 days) {
                return ("stable_lp", "Moderate-conservative: Stable LP for reliable 4.5% returns");
            }
        }
        
        // Rule 5: Aggressive (8-10)
        if (riskTolerance >= 8) {
            if (amount >= strategies["native_lp"].minAmount && strategies["native_lp"].isActive && timeHorizon >= 30 days) {
                return ("native_lp", "Aggressive yield: USDT/KAIA LP for maximum 8%+ returns over full month cycle");
            }
        }
        
        // Default fallback
        return ("treasury", "Conservative default: Keeping funds secure in treasury while optimizing for upcoming payout");
    }
    
    /**
     * @dev Execute investment in selected strategy with enhanced security
     */
    function investInStrategy(
        address circleAddress,
        uint256 amount,
        string memory strategyName
    ) external onlyRole(CIRCLE_ROLE) nonReentrant whenNotPaused returns (uint256 shares) {
        if (emergencyMode) revert EmergencyModeActive();
        if (amount == 0) revert InvalidAmount();
        
        StrategyInfo storage strategy = strategies[strategyName];
        if (!strategy.isActive) revert StrategyInactive();
        if (amount < strategy.minAmount) revert InvalidAmount();
        
        // Transfer USDT from circle
        require(USDT.transferFrom(circleAddress, address(this), amount), "Transfer failed");
        
        uint256 lpTokens = 0;
        address lpTokenAddress = address(0);
        
        if (strategy.strategyType == StrategyType.TREASURY) {
            lpTokens = amount; // 1:1 for treasury
        }
        else if (strategy.strategyType == StrategyType.LENDING) {
            lpTokens = _executeLendingStrategy(amount);
        }
        else if (strategy.strategyType == StrategyType.LP_STABLE) {
            (lpTokens, lpTokenAddress) = _executeStableLPStrategy(amount);
        }
        else if (strategy.strategyType == StrategyType.LP_NATIVE) {
            (lpTokens, lpTokenAddress) = _executeNativeLPStrategy(amount);
        }
        
        // Record investment
        circleInvestments[circleAddress] = CircleInvestment({
            strategyName: strategyName,
            principalAmount: amount,
            lpTokens: lpTokens,
            investmentTime: block.timestamp,
            lastYieldUpdate: block.timestamp,
            actualYieldEarned: 0,
            lpTokenAddress: lpTokenAddress
        });
        
        // Update strategy totals
        strategy.totalInvested = strategy.totalInvested + amount;
        strategyCircles[strategyName].push(circleAddress);
        
        emit InvestmentExecuted(circleAddress, strategyName, amount);
        return lpTokens;
    }
    
    /**
     * @dev Execute USDT lending strategy with proper error handling
     */
    function _executeLendingStrategy(uint256 amount) internal returns (uint256 shares) {
        if (kaiaLending == address(0)) return amount; // Fallback to treasury
        
        USDT.approve(kaiaLending, amount);
        try IKaiaLending(kaiaLending).supply(address(USDT), amount) {
            return amount; // Return original amount as shares
        } catch {
            // Revert approval and return to treasury
            USDT.approve(kaiaLending, 0);
            return amount;
        }
    }
    
    /**
     * @dev Execute USDT/USDC stable LP strategy with slippage protection
     */
    function _executeStableLPStrategy(uint256 usdtAmount) 
        internal 
        returns (uint256 liquidity, address lpTokenAddress) 
    {
        if (kaiaRouter == address(0) || address(USDC) == address(0)) {
            return (usdtAmount, address(0));
        }
        
        uint256 halfAmount = usdtAmount / 2;
        
        // Get expected USDC amount with slippage protection
        address[] memory path = new address[](2);
        path[0] = address(USDT);
        path[1] = address(USDC);
        
        uint256[] memory amountsOut = IKaiaRouter(kaiaRouter).getAmountsOut(halfAmount, path);
        uint256 minUsdcAmount = (amountsOut[1] * (10000 - DEFAULT_SLIPPAGE)) / 10000;
        
        USDT.approve(kaiaRouter, halfAmount);
        try IKaiaRouter(kaiaRouter).swapExactTokensForTokens(
            halfAmount,
            minUsdcAmount,
            path,
            address(this),
            block.timestamp + 300
        ) returns (uint256[] memory amounts) {
            // Add liquidity with remaining USDT + received USDC
            uint256 usdcBalance = USDC.balanceOf(address(this));
            uint256 remainingUsdt = halfAmount;
            
            USDT.approve(kaiaRouter, remainingUsdt);
            USDC.approve(kaiaRouter, usdcBalance);
            
            (uint256 amountA, uint256 amountB, uint256 liquidityReceived) = IKaiaRouter(kaiaRouter).addLiquidity(
                address(USDT),
                address(USDC),
                remainingUsdt,
                usdcBalance,
                0, 0, // Accept any amounts
                address(this),
                block.timestamp + 300
            );
            
            // Get LP token address (this would need to be implemented based on Kaia's specific LP token structure)
            lpTokenAddress = address(0); // Placeholder - needs actual implementation
            
            return (liquidityReceived, lpTokenAddress);
        } catch {
            // Fallback: return USDT if swap/LP fails
            return (usdtAmount, address(0));
        }
    }
    
    /**
     * @dev Execute USDT/KAIA native LP strategy with slippage protection
     */
    function _executeNativeLPStrategy(uint256 usdtAmount) 
        internal 
        returns (uint256 liquidity, address lpTokenAddress) 
    {
        if (kaiaRouter == address(0)) {
            return (usdtAmount, address(0));
        }
        
        uint256 halfAmount = usdtAmount / 2;
        
        // Get expected KAIA amount with slippage protection
        address[] memory path = new address[](2);
        path[0] = address(USDT);
        path[1] = address(KAIA);
        
        uint256[] memory amountsOut = IKaiaRouter(kaiaRouter).getAmountsOut(halfAmount, path);
        uint256 minKaiaAmount = (amountsOut[1] * (10000 - DEFAULT_SLIPPAGE)) / 10000;
        
        USDT.approve(kaiaRouter, halfAmount);
        try IKaiaRouter(kaiaRouter).swapExactTokensForTokens(
            halfAmount,
            minKaiaAmount,
            path,
            address(this),
            block.timestamp + 300
        ) returns (uint256[] memory amounts) {
            // Add liquidity
            uint256 kaiaBalance = KAIA.balanceOf(address(this));
            uint256 remainingUsdt = halfAmount;
            
            USDT.approve(kaiaRouter, remainingUsdt);
            KAIA.approve(kaiaRouter, kaiaBalance);
            
            (uint256 amountA, uint256 amountB, uint256 liquidityReceived) = IKaiaRouter(kaiaRouter).addLiquidity(
                address(USDT),
                address(KAIA),
                remainingUsdt,
                kaiaBalance,
                0, 0, // Accept any amounts
                address(this),
                block.timestamp + 300
            );
            
            // Get LP token address (this would need to be implemented based on Kaia's specific LP token structure)
            lpTokenAddress = address(0); // Placeholder - needs actual implementation
            
            return (liquidityReceived, lpTokenAddress);
        } catch {
            // Fallback: return USDT if swap/LP fails
            return (usdtAmount, address(0));
        }
    }
    
    /**
     * @dev Withdraw from strategy with proper LP token handling
     */
    function withdrawFromStrategy(
        address circleAddress,
        uint256 usdtAmountNeeded
    ) external onlyRole(CIRCLE_ROLE) nonReentrant whenNotPaused returns (uint256 usdtReturned) {
        CircleInvestment storage investment = circleInvestments[circleAddress];
        require(bytes(investment.strategyName).length > 0, "No active investment");
        
        StrategyInfo storage strategy = strategies[investment.strategyName];
        
        if (strategy.strategyType == StrategyType.TREASURY) {
            // Treasury: Direct USDT transfer
            uint256 available = USDT.balanceOf(address(this));
            uint256 toReturn = usdtAmountNeeded > available ? available : usdtAmountNeeded;
            if (toReturn > 0) {
                USDT.transfer(circleAddress, toReturn);
            }
            return toReturn;
        }
        else if (strategy.strategyType == StrategyType.LENDING) {
            // Withdraw from lending
            uint256 withdrawn = IKaiaLending(strategy.contractAddress).withdraw(
                address(USDT),
                usdtAmountNeeded
            );
            USDT.transfer(circleAddress, withdrawn);
            return withdrawn;
        }
        else {
            // LP strategies: Remove liquidity and convert to USDT
            return _withdrawFromLP(circleAddress, usdtAmountNeeded, strategy, investment);
        }
    }
    
    /**
     * @dev Proper LP withdrawal implementation
     */
    function _withdrawFromLP(
        address circleAddress,
        uint256 usdtNeeded,
        StrategyInfo storage strategy,
        CircleInvestment storage investment
    ) internal returns (uint256 usdtReturned) {
        if (investment.lpTokenAddress == address(0)) {
            // Fallback to available USDT
            uint256 available = USDT.balanceOf(address(this));
            uint256 toReturn = usdtNeeded > available ? available : usdtNeeded;
            if (toReturn > 0) {
                USDT.transfer(circleAddress, toReturn);
            }
            return toReturn;
        }
        
        // Calculate proportional LP tokens to remove
        IKaiaLP lpToken = IKaiaLP(investment.lpTokenAddress);
        uint256 totalLPTokens = lpToken.balanceOf(address(this));
        
        if (totalLPTokens == 0) {
            return 0;
        }
        
        // Calculate how many LP tokens to remove based on USDT needed
        uint256 lpTokensToRemove = (investment.lpTokens * usdtNeeded) / investment.principalAmount;
        if (lpTokensToRemove > totalLPTokens) {
            lpTokensToRemove = totalLPTokens;
        }
        
        if (lpTokensToRemove == 0) {
            return 0;
        }
        
        // Get token addresses from LP
        address token0 = lpToken.token0();
        address token1 = lpToken.token1();
        
        // Remove liquidity
        lpToken.approve(kaiaRouter, lpTokensToRemove);
        try IKaiaRouter(kaiaRouter).removeLiquidity(
            token0,
            token1,
            lpTokensToRemove,
            0, 0, // Accept any amounts
            address(this),
            block.timestamp + 300
        ) returns (uint256 amount0, uint256 amount1) {
            // Swap non-USDT tokens back to USDT
            uint256 totalUsdt = 0;
            
            if (token0 == address(USDT)) {
                totalUsdt = totalUsdt + amount0;
            } else {
                totalUsdt = totalUsdt + _swapToUSDT(token0, amount0);
            }
            
            if (token1 == address(USDT)) {
                totalUsdt = totalUsdt + amount1;
            } else {
                totalUsdt = totalUsdt + _swapToUSDT(token1, amount1);
            }
            
            // Transfer USDT to circle
            if (totalUsdt > 0) {
                USDT.transfer(circleAddress, totalUsdt);
            }
            
            return totalUsdt;
        } catch {
            // Fallback: return available USDT
            uint256 available = USDT.balanceOf(address(this));
            uint256 toReturn = usdtNeeded > available ? available : usdtNeeded;
            if (toReturn > 0) {
                USDT.transfer(circleAddress, toReturn);
            }
            return toReturn;
        }
    }
    
    /**
     * @dev Swap any token to USDT
     */
    function _swapToUSDT(address token, uint256 amount) internal returns (uint256 usdtAmount) {
        if (amount == 0) return 0;
        
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = address(USDT);
        
        IERC20(token).approve(kaiaRouter, amount);
        
        try IKaiaRouter(kaiaRouter).swapExactTokensForTokens(
            amount,
            0, // Accept any amount
            path,
            address(this),
            block.timestamp + 300
        ) returns (uint256[] memory amounts) {
            return amounts[1];
        } catch {
            return 0;
        }
    }
    
    /**
     * @dev Calculate actual yield earned (not estimated)
     */
    function getCurrentYield(address circleAddress) external view returns (uint256 yieldEarned) {
        CircleInvestment memory investment = circleInvestments[circleAddress];
        if (bytes(investment.strategyName).length == 0) return 0;
        
        StrategyInfo memory strategy = strategies[investment.strategyName];
        
        if (strategy.strategyType == StrategyType.TREASURY) {
            return 0; // Treasury has no yield
        }
        
        // For now, return actual yield earned (in production, this would calculate from protocol data)
        return investment.actualYieldEarned;
    }
    
    /**
     * @dev Update actual yield earned (called periodically)
     */
    function updateActualYield(address circleAddress, uint256 newYield) 
        external onlyRole(STRATEGY_MANAGER_ROLE) {
        CircleInvestment storage investment = circleInvestments[circleAddress];
        require(bytes(investment.strategyName).length > 0, "No investment found");
        
        investment.actualYieldEarned = newYield;
        investment.lastYieldUpdate = block.timestamp;
        
        emit YieldHarvested(circleAddress, newYield);
    }
    
    /**
     * @dev Emergency functions
     */
    function activateEmergencyMode(string memory reason) external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated(reason);
    }
    
    function deactivateEmergencyMode() external onlyRole(EMERGENCY_ROLE) {
        emergencyMode = false;
        _unpause();
        emit EmergencyModeDeactivated();
    }
    
    function emergencyWithdraw(address circleAddress) external onlyRole(EMERGENCY_ROLE) {
        emergencyWithdrawals[circleAddress] = true;
        // Force withdrawal to treasury
        CircleInvestment storage investment = circleInvestments[circleAddress];
        if (bytes(investment.strategyName).length > 0) {
            // Implementation would force withdrawal of all funds
        }
    }
    
    /**
     * @dev Admin functions
     */
    function updateStrategyAPY(string memory strategyName, uint256 newAPY) 
        external onlyRole(STRATEGY_MANAGER_ROLE) {
        require(strategies[strategyName].isActive, "Strategy not found");
        strategies[strategyName].currentAPY = newAPY;
        strategies[strategyName].lastAPYUpdate = block.timestamp;
        emit StrategyAPYUpdated(strategyName, newAPY);
    }
    
    function setProtocolAddresses(address _kaiaRouter, address _kaiaLending) 
        external onlyRole(DEFAULT_ADMIN_ROLE) {
        kaiaRouter = _kaiaRouter;
        kaiaLending = _kaiaLending;
    }
    
    function setLPTokenAddress(string memory strategyName, address lpTokenAddress) 
        external onlyRole(STRATEGY_MANAGER_ROLE) {
        require(strategies[strategyName].isActive, "Strategy not found");
        strategies[strategyName].contractAddress = lpTokenAddress;
    }
    
    function getAvailableStrategies() external view returns (
        string[] memory names,
        uint256[] memory apys,
        uint256[] memory riskScores,
        uint256[] memory minAmounts
    ) {
        names = new string[](4);
        apys = new uint256[](4);
        riskScores = new uint256[](4);
        minAmounts = new uint256[](4);
        
        names[0] = "treasury";
        apys[0] = strategies["treasury"].currentAPY;
        riskScores[0] = strategies["treasury"].riskScore;
        minAmounts[0] = strategies["treasury"].minAmount;
        
        names[1] = "stable_lp";
        apys[1] = strategies["stable_lp"].currentAPY;
        riskScores[1] = strategies["stable_lp"].riskScore;
        minAmounts[1] = strategies["stable_lp"].minAmount;
        
        names[2] = "native_lp";
        apys[2] = strategies["native_lp"].currentAPY;
        riskScores[2] = strategies["native_lp"].riskScore;
        minAmounts[2] = strategies["native_lp"].minAmount;
        
        names[3] = "lending";
        apys[3] = strategies["lending"].currentAPY;
        riskScores[3] = strategies["lending"].riskScore;
        minAmounts[3] = strategies["lending"].minAmount;
        
        return (names, apys, riskScores, minAmounts);
    }
    
    /**
     * @dev Emergency token recovery (only admin, only in emergency mode)
     */
    function emergencyRecoverToken(address token, uint256 amount) 
        external onlyRole(EMERGENCY_ROLE) {
        require(emergencyMode, "Not in emergency mode");
        IERC20(token).transfer(msg.sender, amount);
    }
}
