/**
 * @title Working Demo Tests
 * @dev Demonstrates core functionality with proper BigNumber handling
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Working Demo - Core Functionality", function () {
    let deployer, user1, user2;
    let usdt, usdc, weth, router, lending, randomGenerator, yieldManager;

    // Test constants
    const INITIAL_BALANCE = ethers.utils.parseUnits("10000", 6); // 10,000 USDT
    const TEST_AMOUNT = ethers.utils.parseUnits("100", 6); // $100 USDT
    const MODERATE_RISK = 5;
    const TIME_HORIZON = 30 * 24 * 60 * 60; // 30 days

    beforeEach(async function () {
        [deployer, user1, user2] = await ethers.getSigners();

        // Deploy mock tokens
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
        usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);

        // Deploy mock protocols
        const MockRouter = await ethers.getContractFactory("MockRouter");
        router = await MockRouter.deploy();

        const MockLending = await ethers.getContractFactory("MockLending");
        lending = await MockLending.deploy();

        // Deploy random generator
        const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
        randomGenerator = await RandomGenerator.deploy(
            deployer.address, // Mock VRF coordinator
            "0x0000000000000000000000000000000000000000000000000000000000000000", // Mock key hash
            1, // Mock subscription ID
            200000, // Callback gas limit
            3 // Request confirmations
        );

        // Deploy yield strategy manager
        const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
        yieldManager = await KaiaYieldStrategyManager.deploy(
            usdt.address,
            weth.address,
            usdc.address,
            router.address,
            lending.address
        );

        // Grant roles
        const STRATEGY_MANAGER_ROLE = await yieldManager.STRATEGY_MANAGER_ROLE();
        const EMERGENCY_ROLE = await yieldManager.EMERGENCY_ROLE();
        const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();

        await yieldManager.grantRole(STRATEGY_MANAGER_ROLE, deployer.address);
        await yieldManager.grantRole(EMERGENCY_ROLE, deployer.address);
        await yieldManager.grantRole(CIRCLE_ROLE, deployer.address);

        // Mint tokens for testing
        await usdt.mint(deployer.address, INITIAL_BALANCE);
        await usdc.mint(deployer.address, INITIAL_BALANCE);
        await weth.mint(deployer.address, ethers.utils.parseEther("100"));
    });

    describe("🎯 Core Functionality Demo", function () {
        it("✅ Should deploy all contracts successfully", async function () {
            console.log("📋 Contract Addresses:");
            console.log("  USDT:", usdt.address);
            console.log("  USDC:", usdc.address);
            console.log("  WETH:", weth.address);
            console.log("  Yield Manager:", yieldManager.address);
            console.log("  Random Generator:", randomGenerator.address);

            expect(await usdt.name()).to.equal("Tether USD");
            expect(await usdc.name()).to.equal("USD Coin");
            expect(await weth.name()).to.equal("Wrapped Ether");
        });

        it("✅ Should have correct initial balances", async function () {
            const deployerBalance = await usdt.balanceOf(deployer.address);
            console.log("💰 Deployer USDT Balance:", ethers.utils.formatUnits(deployerBalance, 6), "USDT");

            expect(deployerBalance.toString()).to.equal(INITIAL_BALANCE.toString());
        });

        it("✅ Should return available strategies", async function () {
            const strategies = await yieldManager.getAvailableStrategies();

            console.log("📈 Available Strategies:");
            for (let i = 0; i < strategies.names.length; i++) {
                console.log(`  ${strategies.names[i]}: ${strategies.apys[i].toString()}% APY, Risk: ${strategies.riskScores[i].toString()}`);
            }

            expect(strategies.names.length).to.equal(4);
            expect(strategies.names[0]).to.equal("treasury");
            expect(strategies.names[1]).to.equal("stable_lp");
            expect(strategies.names[2]).to.equal("native_lp");
            expect(strategies.names[3]).to.equal("lending");
        });

        it("✅ Should select appropriate strategies based on risk", async function () {
            console.log("🤖 AI Strategy Selection Demo:");

            // Test different risk levels
            const testCases = [
                { risk: 1, amount: TEST_AMOUNT, expected: "treasury" },
                { risk: 3, amount: TEST_AMOUNT, expected: "stable_lp" },
                { risk: 5, amount: TEST_AMOUNT, expected: "native_lp" },
                { risk: 9, amount: TEST_AMOUNT, expected: "native_lp" }
            ];

            for (const testCase of testCases) {
                const [strategy, explanation] = await yieldManager.selectBestStrategy(
                    deployer.address,
                    testCase.amount,
                    TIME_HORIZON,
                    testCase.risk
                );

                console.log(`  Risk ${testCase.risk}: Selected "${strategy}"`);
                console.log(`    Explanation: ${explanation}`);
                expect(strategy).to.equal(testCase.expected);
            }
        });

        it("✅ Should handle small amounts and short timeframes", async function () {
            console.log("⏰ Timeframe and Amount Considerations:");

            // Small amount
            const smallAmount = ethers.utils.parseUnits("10", 6);
            const [strategy1, explanation1] = await yieldManager.selectBestStrategy(
                deployer.address,
                smallAmount,
                TIME_HORIZON,
                MODERATE_RISK
            );
            console.log(`  Small amount ($10): "${strategy1}" - ${explanation1}`);
            expect(strategy1).to.equal("treasury");

            // Short timeframe
            const shortTimeframe = 3 * 24 * 60 * 60; // 3 days
            const [strategy2, explanation2] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                shortTimeframe,
                MODERATE_RISK
            );
            console.log(`  Short timeframe (3 days): "${strategy2}" - ${explanation2}`);
            expect(strategy2).to.equal("treasury");
        });

        it("✅ Should execute investments successfully", async function () {
            console.log("💼 Investment Execution Demo:");

            // Approve USDT for yield manager
            await usdt.approve(yieldManager.address, TEST_AMOUNT);

            const strategies = ["treasury", "lending", "stable_lp", "native_lp"];

            for (const strategy of strategies) {
                const initialBalance = await usdt.balanceOf(deployer.address);

                const tx = await yieldManager.investInStrategy(
                    deployer.address,
                    TEST_AMOUNT,
                    strategy
                );
                await tx.wait();

                const finalBalance = await usdt.balanceOf(deployer.address);
                const invested = initialBalance.sub(finalBalance);

                console.log(`  ${strategy}: Invested ${ethers.utils.formatUnits(invested, 6)} USDT`);
                expect(invested.toString()).to.equal(TEST_AMOUNT.toString());
            }
        });

        it("✅ Should track and update yields", async function () {
            console.log("📊 Yield Tracking Demo:");

            // Invest in lending strategy
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "lending"
            );
            await tx.wait();

            // Check initial yield
            let currentYield = await yieldManager.getCurrentYield(deployer.address);
            console.log(`  Initial yield: ${ethers.utils.formatUnits(currentYield, 6)} USDT`);
            expect(currentYield.toString()).to.equal("0");

            // Update yield
            const newYield = ethers.utils.parseUnits("5", 6); // $5 yield
            await yieldManager.updateActualYield(deployer.address, newYield);

            // Check updated yield
            currentYield = await yieldManager.getCurrentYield(deployer.address);
            console.log(`  Updated yield: ${ethers.utils.formatUnits(currentYield, 6)} USDT`);
            expect(currentYield.toString()).to.equal(newYield.toString());
        });

        it("✅ Should handle withdrawals", async function () {
            console.log("💸 Withdrawal Demo:");

            // Invest in treasury
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const investTx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "treasury"
            );
            await investTx.wait();

            const initialBalance = await usdt.balanceOf(deployer.address);

            // Withdraw partial amount
            const withdrawAmount = ethers.utils.parseUnits("50", 6);
            const withdrawTx = await yieldManager.withdrawFromStrategy(
                deployer.address,
                withdrawAmount
            );
            await withdrawTx.wait();

            const finalBalance = await usdt.balanceOf(deployer.address);
            const withdrawn = finalBalance.sub(initialBalance);

            console.log(`  Withdrawn: ${ethers.utils.formatUnits(withdrawn, 6)} USDT`);
            expect(withdrawn.toString()).to.equal(withdrawAmount.toString());
        });

        it("✅ Should handle emergency mode", async function () {
            console.log("🚨 Emergency Mode Demo:");

            // Activate emergency mode
            await yieldManager.activateEmergencyMode("Test emergency");
            const isEmergency = await yieldManager.emergencyMode();
            const isPaused = await yieldManager.paused();

            console.log(`  Emergency mode active: ${isEmergency}`);
            console.log(`  Contract paused: ${isPaused}`);

            expect(isEmergency).to.be.true;
            expect(isPaused).to.be.true;

            // Strategy selection during emergency
            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                MODERATE_RISK
            );

            console.log(`  Strategy during emergency: "${strategy}"`);
            console.log(`  Explanation: ${explanation}`);
            expect(strategy).to.equal("treasury");
            expect(explanation).to.include("Emergency mode active");

            // Deactivate emergency mode
            await yieldManager.deactivateEmergencyMode();
            const isEmergencyAfter = await yieldManager.emergencyMode();
            console.log(`  Emergency mode after deactivation: ${isEmergencyAfter}`);
            expect(isEmergencyAfter).to.be.false;
        });

        it("✅ Should update strategy APYs", async function () {
            console.log("📈 APY Update Demo:");

            // Get initial APYs
            let strategies = await yieldManager.getAvailableStrategies();
            console.log("  Initial APYs:");
            for (let i = 0; i < strategies.names.length; i++) {
                console.log(`    ${strategies.names[i]}: ${strategies.apys[i].toString()}%`);
            }

            // Update lending APY
            const newAPY = 1200; // 12%
            await yieldManager.updateStrategyAPY("lending", newAPY);

            // Check updated APY
            strategies = await yieldManager.getAvailableStrategies();
            const lendingAPY = strategies.apys[3]; // lending is index 3
            console.log(`  Updated lending APY: ${lendingAPY.toString()}%`);

            expect(lendingAPY.toString()).to.equal("1200");
        });

        it("✅ Should handle complete investment cycle", async function () {
            console.log("🔄 Complete Investment Cycle Demo:");

            // 1. Select strategy
            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                MODERATE_RISK
            );
            console.log(`  1. Selected strategy: "${strategy}"`);
            console.log(`     Reason: ${explanation}`);

            // 2. Approve and invest
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const investTx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                strategy
            );
            await investTx.wait();
            console.log(`  2. Invested ${ethers.utils.formatUnits(TEST_AMOUNT, 6)} USDT in ${strategy}`);

            // 3. Update yield
            const yieldEarned = ethers.utils.parseUnits("10", 6); // $10 yield
            await yieldManager.updateActualYield(deployer.address, yieldEarned);
            console.log(`  3. Updated yield to ${ethers.utils.formatUnits(yieldEarned, 6)} USDT`);

            // 4. Check current yield
            const currentYield = await yieldManager.getCurrentYield(deployer.address);
            console.log(`  4. Current yield: ${ethers.utils.formatUnits(currentYield, 6)} USDT`);
            expect(currentYield.toString()).to.equal(yieldEarned.toString());

            // 5. Withdraw
            const withdrawAmount = ethers.utils.parseUnits("50", 6);
            const withdrawTx = await yieldManager.withdrawFromStrategy(
                deployer.address,
                withdrawAmount
            );
            await withdrawTx.wait();
            console.log(`  5. Withdrew ${ethers.utils.formatUnits(withdrawAmount, 6)} USDT`);

            console.log("✅ Complete investment cycle successful!");
        });
    });

    describe("🎯 Multi-User Demo", function () {
        it("✅ Should handle multiple users", async function () {
            console.log("👥 Multi-User Demo:");

            // Mint tokens for user1
            await usdt.mint(user1.address, TEST_AMOUNT);
            await usdt.connect(user1).approve(yieldManager.address, TEST_AMOUNT);

            // Grant CIRCLE_ROLE to user1
            const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
            await yieldManager.grantRole(CIRCLE_ROLE, user1.address);

            // User1 invests
            const tx1 = await yieldManager.connect(user1).investInStrategy(
                user1.address,
                TEST_AMOUNT,
                "lending"
            );
            await tx1.wait();
            console.log(`  User1 invested ${ethers.utils.formatUnits(TEST_AMOUNT, 6)} USDT in lending`);

            // Deployer invests
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const tx2 = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "treasury"
            );
            await tx2.wait();
            console.log(`  Deployer invested ${ethers.utils.formatUnits(TEST_AMOUNT, 6)} USDT in treasury`);

            // Check both investments
            const user1Yield = await yieldManager.getCurrentYield(user1.address);
            const deployerYield = await yieldManager.getCurrentYield(deployer.address);

            console.log(`  User1 current yield: ${ethers.utils.formatUnits(user1Yield, 6)} USDT`);
            console.log(`  Deployer current yield: ${ethers.utils.formatUnits(deployerYield, 6)} USDT`);

            expect(user1Yield.toString()).to.equal("0");
            expect(deployerYield.toString()).to.equal("0");

            console.log("✅ Multi-user scenario successful!");
        });
    });
});
