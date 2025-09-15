/**
 * @title Simple Yield Protocol Tests
 * @dev Basic tests that work with current setup
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Simple Yield Protocol Tests", function () {
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

    describe("Deployment", function () {
        it("Should deploy all contracts successfully", async function () {
            expect(await usdt.name()).to.equal("Tether USD");
            expect(await usdc.name()).to.equal("USD Coin");
            expect(await weth.name()).to.equal("Wrapped Ether");
            expect(await yieldManager.USDT()).to.equal(usdt.address);
            expect(await yieldManager.KAIA()).to.equal(weth.address);
            expect(await yieldManager.USDC()).to.equal(usdc.address);
        });

        it("Should have correct initial balances", async function () {
            const deployerBalance = await usdt.balanceOf(deployer.address);
            expect(deployerBalance).to.equal(INITIAL_BALANCE);
        });

        it("Should have correct roles assigned", async function () {
            const STRATEGY_MANAGER_ROLE = await yieldManager.STRATEGY_MANAGER_ROLE();
            const EMERGENCY_ROLE = await yieldManager.EMERGENCY_ROLE();
            const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();

            expect(await yieldManager.hasRole(STRATEGY_MANAGER_ROLE, deployer.address)).to.be.true;
            expect(await yieldManager.hasRole(EMERGENCY_ROLE, deployer.address)).to.be.true;
            expect(await yieldManager.hasRole(CIRCLE_ROLE, deployer.address)).to.be.true;
        });
    });

    describe("Yield Strategies", function () {
        it("Should return available strategies", async function () {
            const strategies = await yieldManager.getAvailableStrategies();

            expect(strategies.names.length).to.equal(4);
            expect(strategies.names[0]).to.equal("treasury");
            expect(strategies.names[1]).to.equal("stable_lp");
            expect(strategies.names[2]).to.equal("native_lp");
            expect(strategies.names[3]).to.equal("lending");
        });

        it("Should have correct APY values", async function () {
            const strategies = await yieldManager.getAvailableStrategies();

            expect(strategies.apys[0].toString()).to.equal("0"); // Treasury: 0%
            expect(strategies.apys[1].toString()).to.equal("450"); // Stable LP: 4.5%
            expect(strategies.apys[2].toString()).to.equal("800"); // Native LP: 8%
            expect(strategies.apys[3].toString()).to.equal("600"); // Lending: 6%
        });

        it("Should have correct risk scores", async function () {
            const strategies = await yieldManager.getAvailableStrategies();

            expect(strategies.riskScores[0].toString()).to.equal("1"); // Treasury: lowest risk
            expect(strategies.riskScores[1].toString()).to.equal("2"); // Stable LP: low risk
            expect(strategies.riskScores[2].toString()).to.equal("5"); // Native LP: medium risk
            expect(strategies.riskScores[3].toString()).to.equal("3"); // Lending: conservative
        });

        it("Should have correct minimum amounts", async function () {
            const strategies = await yieldManager.getAvailableStrategies();

            expect(strategies.minAmounts[0].toString()).to.equal("0"); // Treasury: no minimum
            expect(strategies.minAmounts[1].toString()).to.equal("50000000"); // $50
            expect(strategies.minAmounts[2].toString()).to.equal("100000000"); // $100
            expect(strategies.minAmounts[3].toString()).to.equal("25000000"); // $25
        });
    });

    describe("AI Strategy Selection", function () {
        it("Should select treasury for small amounts", async function () {
            const smallAmount = ethers.utils.parseUnits("10", 6); // $10

            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                smallAmount,
                TIME_HORIZON,
                MODERATE_RISK
            );

            expect(strategy).to.equal("treasury");
            expect(explanation).to.include("Amount below $25");
        });

        it("Should select treasury for short timeframes", async function () {
            const shortTimeframe = 3 * 24 * 60 * 60; // 3 days

            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                shortTimeframe,
                MODERATE_RISK
            );

            expect(strategy).to.equal("treasury");
            expect(explanation).to.include("Short timeframe");
        });

        it("Should select stable_lp for conservative risk", async function () {
            const conservativeRisk = 2;

            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                conservativeRisk
            );

            expect(strategy).to.equal("stable_lp");
            expect(explanation).to.include("Conservative approach");
        });

        it("Should select native_lp for moderate risk", async function () {
            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                MODERATE_RISK
            );

            expect(strategy).to.equal("native_lp");
            expect(explanation).to.include("Balanced approach");
        });

        it("Should select native_lp for aggressive risk", async function () {
            const aggressiveRisk = 9;

            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                aggressiveRisk
            );

            expect(strategy).to.equal("native_lp");
            expect(explanation).to.include("Aggressive yield");
        });

        it("Should provide meaningful explanations", async function () {
            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                MODERATE_RISK
            );

            expect(explanation.length).to.be.greaterThan(10);
            expect(explanation).to.include("APY");
        });
    });

    describe("Investment Execution", function () {
        beforeEach(async function () {
            // Approve USDT for yield manager
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
        });

        it("Should execute treasury investment", async function () {
            const initialBalance = await usdt.balanceOf(deployer.address);

            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "treasury"
            );

            // Wait for transaction to complete
            await tx.wait();

            expect(await usdt.balanceOf(deployer.address)).to.equal(initialBalance.sub(TEST_AMOUNT));
        });

        it("Should execute lending investment", async function () {
            const initialBalance = await usdt.balanceOf(deployer.address);

            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "lending"
            );

            // Wait for transaction to complete
            await tx.wait();

            expect(await usdt.balanceOf(deployer.address)).to.equal(initialBalance.sub(TEST_AMOUNT));
        });

        it("Should execute stable LP investment", async function () {
            const initialBalance = await usdt.balanceOf(deployer.address);

            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "stable_lp"
            );

            // Wait for transaction to complete
            await tx.wait();

            expect(await usdt.balanceOf(deployer.address)).to.equal(initialBalance.sub(TEST_AMOUNT));
        });

        it("Should execute native LP investment", async function () {
            const initialBalance = await usdt.balanceOf(deployer.address);

            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "native_lp"
            );

            // Wait for transaction to complete
            await tx.wait();

            expect(await usdt.balanceOf(deployer.address)).to.equal(initialBalance.sub(TEST_AMOUNT));
        });
    });

    describe("Yield Tracking", function () {
        beforeEach(async function () {
            // Approve and invest
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "lending"
            );
            await tx.wait();
        });

        it("Should track current yield", async function () {
            const currentYield = await yieldManager.getCurrentYield(deployer.address);
            expect(currentYield.toString()).to.equal("0"); // Initially no yield
        });

        it("Should allow updating yield", async function () {
            const newYield = ethers.utils.parseUnits("5", 6); // $5 yield

            await yieldManager.updateActualYield(deployer.address, newYield);

            const currentYield = await yieldManager.getCurrentYield(deployer.address);
            expect(currentYield).to.equal(newYield);
        });
    });

    describe("Withdrawal", function () {
        beforeEach(async function () {
            // Approve and invest
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "treasury"
            );
            await tx.wait();
        });

        it("Should withdraw from treasury", async function () {
            const withdrawAmount = ethers.utils.parseUnits("50", 6); // $50

            const tx = await yieldManager.withdrawFromStrategy(
                deployer.address,
                withdrawAmount
            );

            // Wait for transaction to complete
            await tx.wait();

            // Check that withdrawal was successful (balance should increase)
            const balance = await usdt.balanceOf(deployer.address);
            expect(balance).to.be.greaterThan(ethers.utils.parseUnits("9950", 6)); // Should have more than initial - investment
        });

        it("Should withdraw partial amount", async function () {
            const withdrawAmount = ethers.utils.parseUnits("30", 6); // $30

            const tx = await yieldManager.withdrawFromStrategy(
                deployer.address,
                withdrawAmount
            );

            // Wait for transaction to complete
            await tx.wait();

            // Check that withdrawal was successful
            const balance = await usdt.balanceOf(deployer.address);
            expect(balance).to.be.greaterThan(ethers.utils.parseUnits("9970", 6)); // Should have more than initial - investment
        });
    });

    describe("Emergency Functions", function () {
        it("Should activate emergency mode", async function () {
            await yieldManager.activateEmergencyMode("Test emergency");

            expect(await yieldManager.emergencyMode()).to.be.true;
            expect(await yieldManager.paused()).to.be.true;
        });

        it("Should deactivate emergency mode", async function () {
            await yieldManager.activateEmergencyMode("Test emergency");
            await yieldManager.deactivateEmergencyMode();

            expect(await yieldManager.emergencyMode()).to.be.false;
            expect(await yieldManager.paused()).to.be.false;
        });

        it("Should select treasury during emergency", async function () {
            await yieldManager.activateEmergencyMode("Test emergency");

            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                MODERATE_RISK
            );

            expect(strategy).to.equal("treasury");
            expect(explanation).to.include("Emergency mode active");
        });
    });

    describe("Strategy Management", function () {
        it("Should update strategy APY", async function () {
            const newAPY = 1200; // 12%

            await yieldManager.updateStrategyAPY("lending", newAPY);

            const strategies = await yieldManager.getAvailableStrategies();
            expect(strategies.apys[3].toString()).to.equal("1200"); // lending is index 3
        });
    });

    describe("Integration Scenarios", function () {
        it("Should handle complete investment cycle", async function () {
            // 1. Select strategy
            const [strategy, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                TEST_AMOUNT,
                TIME_HORIZON,
                MODERATE_RISK
            );

            // 2. Approve tokens
            await usdt.approve(yieldManager.address, TEST_AMOUNT);

            // 3. Invest
            const tx = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                strategy
            );
            await tx.wait();

            // 4. Update yield
            const yieldEarned = ethers.utils.parseUnits("10", 6); // $10 yield
            await yieldManager.updateActualYield(deployer.address, yieldEarned);

            // 5. Check current yield
            const currentYield = await yieldManager.getCurrentYield(deployer.address);
            expect(currentYield).to.equal(yieldEarned);

            // 6. Withdraw
            const withdrawAmount = ethers.utils.parseUnits("50", 6);
            const withdrawTx = await yieldManager.withdrawFromStrategy(
                deployer.address,
                withdrawAmount
            );
            await withdrawTx.wait();

            // Check that withdrawal was successful
            const balance = await usdt.balanceOf(deployer.address);
            expect(balance).to.be.greaterThan(ethers.utils.parseUnits("9950", 6));
        });

        it("Should handle multiple users", async function () {
            // Mint tokens for user1
            await usdt.mint(user1.address, TEST_AMOUNT);
            await usdt.connect(user1).approve(yieldManager.address, TEST_AMOUNT);

            // Grant CIRCLE_ROLE to user1 for testing
            const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
            await yieldManager.grantRole(CIRCLE_ROLE, user1.address);

            // User1 invests
            const tx1 = await yieldManager.connect(user1).investInStrategy(
                user1.address,
                TEST_AMOUNT,
                "lending"
            );
            await tx1.wait();

            // Deployer invests
            await usdt.approve(yieldManager.address, TEST_AMOUNT);
            const tx2 = await yieldManager.investInStrategy(
                deployer.address,
                TEST_AMOUNT,
                "treasury"
            );
            await tx2.wait();

            // Check both investments
            const user1Yield = await yieldManager.getCurrentYield(user1.address);
            const deployerYield = await yieldManager.getCurrentYield(deployer.address);

            expect(user1Yield.toString()).to.equal("0");
            expect(deployerYield.toString()).to.equal("0");
        });
    });
});
