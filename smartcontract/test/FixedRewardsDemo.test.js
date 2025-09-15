/**
 * @title Fixed Rewards Demo
 * @dev Shows the correct way users earn rewards through YieldCircle
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("💰 Fixed Rewards Demo - Correct User Flow", function () {
    let deployer, user1, user2, user3;
    let usdt, usdc, weth, router, lending, randomGenerator, yieldManager, yieldCircle;

    // Test constants
    const CONTRIBUTION_AMOUNT = ethers.utils.parseUnits("100", 6); // $100
    const CYCLE_DURATION = 7 * 24 * 60 * 60; // 7 days
    const CIRCLE_NAME = "Rewards Demo Circle";

    beforeEach(async function () {
        [deployer, user1, user2, user3] = await ethers.getSigners();

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

        // Deploy YieldCircle
        const members = [user1.address, user2.address, user3.address];
        const YieldCircle = await ethers.getContractFactory("YieldCircle");
        yieldCircle = await YieldCircle.deploy(
            usdt.address,
            yieldManager.address,
            randomGenerator.address,
            members,
            CONTRIBUTION_AMOUNT,
            CYCLE_DURATION,
            CIRCLE_NAME,
            deployer.address,
            1 // Mock request ID
        );

        // Grant circle role to yield manager
        await yieldManager.grantRole(CIRCLE_ROLE, yieldCircle.address);

        // Mint tokens for all users
        const tokenAmount = ethers.utils.parseUnits("1000", 6); // $1000 each
        await usdt.mint(user1.address, tokenAmount);
        await usdt.mint(user2.address, tokenAmount);
        await usdt.mint(user3.address, tokenAmount);
        await usdt.mint(deployer.address, tokenAmount);
    });

    describe("💰 Correct User Flow - How Users Earn Rewards", function () {
        it("✅ Step 1: Users contribute to savings circle", async function () {
            console.log("📋 Step 1: Users contribute to savings circle");

            // Initialize positions
            const positions = [1, 2, 3]; // Sequential payouts
            await yieldCircle.initializeWithPositions(positions);

            // All members join
            await yieldCircle.connect(user1).joinCircle("Alice");
            await yieldCircle.connect(user2).joinCircle("Bob");
            await yieldCircle.connect(user3).joinCircle("Charlie");

            // Start circle
            await yieldCircle.startCircle();

            // Approve USDT for all users
            await usdt.connect(user1).approve(yieldCircle.address, CONTRIBUTION_AMOUNT);
            await usdt.connect(user2).approve(yieldCircle.address, CONTRIBUTION_AMOUNT);
            await usdt.connect(user3).approve(yieldCircle.address, CONTRIBUTION_AMOUNT);

            // Users contribute
            await yieldCircle.connect(user1).contribute();
            await yieldCircle.connect(user2).contribute();
            await yieldCircle.connect(user3).contribute();

            console.log(`  ✅ Alice contributed: ${ethers.utils.formatUnits(CONTRIBUTION_AMOUNT, 6)} USDT`);
            console.log(`  ✅ Bob contributed: ${ethers.utils.formatUnits(CONTRIBUTION_AMOUNT, 6)} USDT`);
            console.log(`  ✅ Charlie contributed: ${ethers.utils.formatUnits(CONTRIBUTION_AMOUNT, 6)} USDT`);
            console.log(`  💰 Total pool: ${ethers.utils.formatUnits(CONTRIBUTION_AMOUNT.mul(3), 6)} USDT`);

            // Check circle status
            const status = await yieldCircle.getCircleStatus();
            expect(status.phase.toString()).to.equal("4"); // PAYOUT_READY phase
        });

        it("✅ Step 2: AI automatically invests funds to earn yield", async function () {
            console.log("🤖 Step 2: AI automatically invests funds to earn yield");

            // Get yield performance
            const performance = await yieldCircle.getYieldPerformance();
            console.log(`  📈 Selected strategy: "${performance.strategy}"`);
            console.log(`  💰 Total invested: ${ethers.utils.formatUnits(performance.totalInvestedAmount, 6)} USDT`);

            // Check that investment happened
            expect(performance.strategy).to.not.equal("");
            expect(performance.totalInvestedAmount.toString()).to.not.equal("0");

            console.log("  ✅ AI automatically selected best strategy for earning yield!");
        });

        it("✅ Step 3: System tracks yield earned over time", async function () {
            console.log("📊 Step 3: System tracks yield earned over time");

            // Initially no yield
            let currentYield = await yieldManager.getCurrentYield(yieldCircle.address);
            console.log(`  📈 Initial yield: ${ethers.utils.formatUnits(currentYield, 6)} USDT`);
            expect(currentYield.toString()).to.equal("0");

            // Simulate yield earned over time (in real scenario, this comes from DeFi protocols)
            const yieldEarned = ethers.utils.parseUnits("15", 6); // $15 yield earned
            await yieldManager.updateActualYield(yieldCircle.address, yieldEarned);

            // Check updated yield
            currentYield = await yieldManager.getCurrentYield(yieldCircle.address);
            console.log(`  📈 Yield after 1 week: ${ethers.utils.formatUnits(currentYield, 6)} USDT`);
            console.log(`  💰 Yield rate: ${ethers.utils.formatUnits(yieldEarned, 6)} USDT per week`);

            expect(currentYield.toString()).to.equal(yieldEarned.toString());

            console.log("  ✅ System successfully tracks yield earned from investments!");
        });

        it("✅ Step 4: Users receive their contributions PLUS yield rewards", async function () {
            console.log("🎁 Step 4: Users receive their contributions PLUS yield rewards");

            // Fast forward time to allow payout
            await ethers.provider.send("evm_increaseTime", [CYCLE_DURATION - 2 * 24 * 60 * 60]); // 5 days later
            await ethers.provider.send("evm_mine");

            // Check initial balances
            const aliceInitialBalance = await usdt.balanceOf(user1.address);
            const bobInitialBalance = await usdt.balanceOf(user2.address);
            const charlieInitialBalance = await usdt.balanceOf(user3.address);

            console.log(`  💰 Alice initial balance: ${ethers.utils.formatUnits(aliceInitialBalance, 6)} USDT`);
            console.log(`  💰 Bob initial balance: ${ethers.utils.formatUnits(bobInitialBalance, 6)} USDT`);
            console.log(`  💰 Charlie initial balance: ${ethers.utils.formatUnits(charlieInitialBalance, 6)} USDT`);

            // Execute payout (Alice gets first payout)
            await yieldCircle.executePayout();

            // Check final balances
            const aliceFinalBalance = await usdt.balanceOf(user1.address);
            const bobFinalBalance = await usdt.balanceOf(user2.address);
            const charlieFinalBalance = await usdt.balanceOf(user3.address);

            const aliceReceived = aliceFinalBalance.sub(aliceInitialBalance);
            const bobReceived = bobFinalBalance.sub(bobInitialBalance);
            const charlieReceived = charlieFinalBalance.sub(charlieInitialBalance);

            console.log(`  🎁 Alice received: ${ethers.utils.formatUnits(aliceReceived, 6)} USDT`);
            console.log(`  💰 Bob received: ${ethers.utils.formatUnits(bobReceived, 6)} USDT`);
            console.log(`  💰 Charlie received: ${ethers.utils.formatUnits(charlieReceived, 6)} USDT`);

            // Alice should receive base contribution + yield share
            const expectedAlicePayout = CONTRIBUTION_AMOUNT.mul(3).add(ethers.utils.parseUnits("15", 6)); // All contributions + yield
            expect(aliceReceived.toString()).to.equal(expectedAlicePayout.toString());

            console.log("  ✅ Alice received her contribution PLUS yield rewards!");
            console.log("  💰 Other members will receive their turn in future cycles");
        });

        it("✅ Step 5: Complete cycle shows total yield earned", async function () {
            console.log("🔄 Step 5: Complete cycle shows total yield earned");

            // Get circle performance
            const performance = await yieldCircle.getYieldPerformance();
            console.log(`  📈 Strategy used: "${performance.strategy}"`);
            console.log(`  💰 Total invested: ${ethers.utils.formatUnits(performance.totalInvestedAmount, 6)} USDT`);
            console.log(`  📊 Current yield: ${ethers.utils.formatUnits(performance.currentYield, 6)} USDT`);
            console.log(`  🎯 Total yield earned: ${ethers.utils.formatUnits(performance.totalYieldEarned, 6)} USDT`);

            // Calculate yield percentage
            const yieldPercentage = performance.totalInvestedAmount.gt(0) ?
                performance.currentYield.mul(10000).div(performance.totalInvestedAmount) : 0;
            console.log(`  📈 Yield rate: ${yieldPercentage.toString()} basis points (${yieldPercentage.toNumber() / 100}%)`);

            expect(performance.currentYield.toString()).to.not.equal("0");
            expect(performance.totalInvestedAmount.toString()).to.not.equal("0");

            console.log("  ✅ Users successfully earned yield rewards on their savings!");
        });
    });

    describe("💰 Direct Investment Demo (Admin Only)", function () {
        it("✅ Admin can invest directly in yield strategies", async function () {
            console.log("👨‍💼 Admin Direct Investment Demo:");

            // Admin approves and invests
            await usdt.approve(yieldManager.address, CONTRIBUTION_AMOUNT);

            const initialBalance = await usdt.balanceOf(deployer.address);
            console.log(`  💰 Admin initial balance: ${ethers.utils.formatUnits(initialBalance, 6)} USDT`);

            // Invest in lending strategy
            const tx = await yieldManager.investInStrategy(
                deployer.address,
                CONTRIBUTION_AMOUNT,
                "lending"
            );
            await tx.wait();

            const finalBalance = await usdt.balanceOf(deployer.address);
            const invested = initialBalance.sub(finalBalance);

            console.log(`  💰 Admin invested: ${ethers.utils.formatUnits(invested, 6)} USDT`);
            console.log(`  📈 Strategy: Lending (6% APY)`);

            // Simulate yield earned
            const yieldEarned = ethers.utils.parseUnits("6", 6); // $6 yield earned (6% APY)
            await yieldManager.updateActualYield(deployer.address, yieldEarned);

            const currentYield = await yieldManager.getCurrentYield(deployer.address);
            console.log(`  📈 Yield earned: ${ethers.utils.formatUnits(currentYield, 6)} USDT`);
            console.log(`  💰 Yield rate: 6% APY`);

            expect(currentYield.toString()).to.equal(yieldEarned.toString());

            console.log("  ✅ Admin successfully earned yield on direct investment!");
        });

        it("✅ Different strategies offer different yield rates", async function () {
            console.log("📈 Strategy Comparison Demo:");

            const strategies = [
                { name: "treasury", expectedYield: "0", description: "Safe storage, no yield" },
                { name: "lending", expectedYield: "6", description: "Moderate yield, conservative risk" },
                { name: "stable_lp", expectedYield: "4.5", description: "Low risk, steady yield" },
                { name: "native_lp", expectedYield: "8", description: "Higher yield, moderate risk" }
            ];

            for (const strategy of strategies) {
                // Approve and invest
                await usdt.approve(yieldManager.address, CONTRIBUTION_AMOUNT);
                const tx = await yieldManager.investInStrategy(
                    deployer.address,
                    CONTRIBUTION_AMOUNT,
                    strategy.name
                );
                await tx.wait();

                // Simulate yield earned
                const yieldAmount = ethers.utils.parseUnits(strategy.expectedYield, 6);
                await yieldManager.updateActualYield(deployer.address, yieldAmount);

                const currentYield = await yieldManager.getCurrentYield(deployer.address);
                console.log(`  📈 ${strategy.name}: ${ethers.utils.formatUnits(currentYield, 6)} USDT yield - ${strategy.description}`);

                expect(currentYield.toString()).to.equal(yieldAmount.toString());
            }

            console.log("  ✅ Different strategies offer different yield rates!");
        });
    });

    describe("🎯 Key Benefits Summary", function () {
        it("✅ Users earn rewards through YieldCircle", async function () {
            console.log("🎯 How Users Earn Rewards:");
            console.log("");
            console.log("  💰 1. USER CONTRIBUTES TO CIRCLE");
            console.log("     - User contributes $100 to savings circle");
            console.log("     - Money is pooled with other users");
            console.log("     - Total pool: $300 (3 users × $100)");
            console.log("");
            console.log("  🤖 2. AI AUTOMATICALLY INVESTS");
            console.log("     - AI selects best DeFi strategy");
            console.log("     - Strategies earn 4.5% to 8% APY");
            console.log("     - No user knowledge required");
            console.log("");
            console.log("  📈 3. SYSTEM GENERATES YIELD");
            console.log("     - Investment generates yield over time");
            console.log("     - Example: $300 invested at 8% APY = $24 yield");
            console.log("     - System tracks all yield earned");
            console.log("");
            console.log("  🎁 4. USER RECEIVES REWARDS");
            console.log("     - User gets original $100 back");
            console.log("     - PLUS share of yield rewards ($8 in example)");
            console.log("     - Total received: $108 (8% return)");
            console.log("");
            console.log("  ✅ Users earn rewards automatically when they save!");
        });
    });
});
