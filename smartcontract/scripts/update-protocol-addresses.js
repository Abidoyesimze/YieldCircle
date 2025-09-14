/**
 * @title Protocol Address Update Script
 * @dev Updates protocol addresses for yield integration
 */

const { getNetworkConfig } = require('../config/testnet-addresses.js');

async function updateProtocolAddresses() {
    const networkName = process.env.NETWORK || 'kaia-testnet';
    const config = getNetworkConfig(networkName);

    console.log(`\n🔧 Updating protocol addresses for ${networkName}...`);
    console.log(`Chain ID: ${config.chainId}`);
    console.log(`RPC URL: ${config.rpcUrl}`);

    // Display current configuration
    console.log('\n📋 Current Configuration:');
    console.log('Tokens:');
    console.log(`  USDT: ${config.tokens.USDT}`);
    console.log(`  KAIA: ${config.tokens.KAIA}`);
    console.log(`  USDC: ${config.tokens.USDC}`);

    console.log('\nProtocols:');
    console.log(`  Router: ${config.protocols.router}`);
    console.log(`  Lending: ${config.protocols.lending}`);
    console.log(`  Factory: ${config.protocols.factory}`);

    console.log('\nVRF:');
    console.log(`  Coordinator: ${config.vrf.coordinator}`);
    console.log(`  Key Hash: ${config.vrf.keyHash}`);
    console.log(`  Subscription ID: ${config.vrf.subscriptionId}`);

    // Validate addresses
    console.log('\n🔍 Validating addresses...');
    const requiredAddresses = [
        { name: 'USDT Token', address: config.tokens.USDT },
        { name: 'USDC Token', address: config.tokens.USDC },
        { name: 'Router', address: config.protocols.router },
        { name: 'Lending Protocol', address: config.protocols.lending },
        { name: 'VRF Coordinator', address: config.vrf.coordinator }
    ];

    requiredAddresses.forEach(({ name, address }) => {
        if (!address || address === "0x0000000000000000000000000000000000000000") {
            console.log(`❌ ${name}: Not configured`);
        } else {
            console.log(`✅ ${name}: ${address}`);
        }
    });

    console.log('\n📝 Next Steps:');
    console.log('1. Update missing addresses in config/testnet-addresses.js');
    console.log('2. Deploy contracts with: npm run deploy:testnet');
    console.log('3. Verify contracts on explorer');
    console.log('4. Test yield strategies');
}

if (require.main === module) {
    updateProtocolAddresses().catch(console.error);
}

module.exports = { updateProtocolAddresses };
