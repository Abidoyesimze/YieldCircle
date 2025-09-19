require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
require("hardhat-contract-sizer");

const { PRIVATE_KEY, KAIA_TESTNET_URL, KAIA_MAINNET_URL } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    kairos: {
      url: KAIA_TESTNET_URL || "https://public-en-kairos.node.kaia.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1001,
      gasPrice: 25_000_000_000,
    },
    kaia: {
      url: KAIA_MAINNET_URL || "https://public-en.node.kaia.io",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 8217,
      gasPrice: 25_000_000_000,
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
};
