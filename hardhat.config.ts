require('dotenv').config()

import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
  defaultNetwork: "mainnet",
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 9500000,
      gasPrice: 29000000000,
      gasMultiplier: 1,
      hardfork: "muirGlacier",
      blockGasLimit: 9500000,
      throwOnTransactionFailures: false,
      throwOnCallFailures: false,
      allowUnlimitedContractSize: false,
      loggingEnabled: false,
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [
        process.env.ETH_OPERATOR_KEY!
      ]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [
        process.env.ETH_OPERATOR_KEY!
      ]
    }
  },
  solidity: {
    version: "0.5.15",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  }
};

export default config;