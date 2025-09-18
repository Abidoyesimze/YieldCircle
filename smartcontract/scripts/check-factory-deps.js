const { ethers } = require("hardhat");

async function checkFactoryDependencies() {
    console.log("🔍 Checking YieldCircleFactory dependencies...\n");
    
    // Your current factory address
    const factoryAddress = "0x277490C4cc17Ca14A43f0a293656f78E6e10448C";
    
    try {
        // Get the factory contract
        const factory = await ethers.getContractAt("YieldCircleFactory", factoryAddress);
        
        // Check what addresses it was deployed with
        console.log("📋 Factory Dependencies:");
        const usdtAddress = await factory.USDT();
        const yieldManagerAddress = await factory.yieldManager();
        const randomGeneratorAddress = await factory.randomGenerator();
        
        console.log(`USDT: ${usdtAddress}`);
        console.log(`Yield Manager: ${yieldManagerAddress}`);
        console.log(`Random Generator: ${randomGeneratorAddress}`);
        
        // Check if these contracts exist
        console.log("\n🔍 Checking if contracts exist:");
        
        const provider = ethers.provider;
        
        const usdtCode = await provider.getCode(usdtAddress);
        const yieldManagerCode = await provider.getCode(yieldManagerAddress);
        const randomGeneratorCode = await provider.getCode(randomGeneratorAddress);
        
        console.log(`USDT contract exists: ${usdtCode !== '0x' ? '✅' : '❌'}`);
        console.log(`Yield Manager contract exists: ${yieldManagerCode !== '0x' ? '✅' : '❌'}`);
        console.log(`Random Generator contract exists: ${randomGeneratorCode !== '0x' ? '✅' : '❌'}`);
        
        // Check template status
        console.log("\n📋 Checking Family Template:");
        try {
            const template = await factory.templates("family");
            console.log(`Template active: ${template.isActive ? '✅' : '❌'}`);
            console.log(`Min members: ${template.minMembers.toString()}`);
            console.log(`Max members: ${template.maxMembers.toString()}`);
            console.log(`Min contribution: ${template.minContribution.toString()}`);
            console.log(`Max contribution: ${template.maxContribution.toString()}`);
            console.log(`Allowed durations: ${template.allowedDurations.map(d => d.toString())}`);
        } catch (err) {
            console.log(`❌ Error checking template: ${err.message}`);
        }
        
        // Check if factory is paused
        console.log("\n⏸️ Checking Factory Status:");
        try {
            const isPaused = await factory.paused();
            console.log(`Factory paused: ${isPaused ? '❌ YES' : '✅ NO'}`);
        } catch (err) {
            console.log(`❌ Error checking pause status: ${err.message}`);
        }
        
    } catch (error) {
        console.error("❌ Error checking factory:", error.message);
    }
}

checkFactoryDependencies()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
