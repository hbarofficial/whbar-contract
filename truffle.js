const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

const config = {
  'ganacheUnitTest': {
    'ref': 'ganache-unit-test',
    'host': '127.0.0.1',
    'port': 8545,
    'network_id': '*',
    'gas': 7989556,
    'gasPrice': 9000000000
  },
  'ganacheIntegration': {
    'ref': 'ganache-integration',
    'host': '127.0.0.1',
    'port': 8545,
    'network_id': '*',
    'gas': 7989556,
    'gasPrice': 100000000000
  },
  'gethUnitTest': {
    'ref': 'geth-unit-test',
    'host': '127.0.0.1',
    'port': 8550,
    'wsPort': 8551,
    'networkId': 85500,
    'gas': 7989556,
    'gasPrice': 100000000000,
    'testOnlyHDWPasscode': 'ichi',
    'chainId': 5,
    'network_id': 5
  },
  'gethIntegration': {
    'ref': 'geth-integration',
    'host': '127.0.0.1',
    'port': 7560,
    'wsPort': 7561,
    'networkId': 75600,
    'gas': 7989556,
    'gasPrice': 100000000000,
    'testOnlyHDWPasscode': 'ichi',
    'chainId': 5,
    'network_id': 5
  },
  'testrpcCoverage': {
    'ref': 'testrpc-coverage',
    'host': '127.0.0.1',
    'port': 6545,
    'wsPort': 6546,
    'networkId': '*',
    'gas': '0xfffffffffff',
    'gasPrice': '0x01',
    'chainId': 5,
    'network_id': 5
  }
};

const privKeys = [process.env.ETH_OPERATOR_KEY];

module.exports = {
  networks: {
    ganacheUnitTest: config.ganacheUnitTest,
    gethUnitTest: config.gethUnitTest,
    testrpcCoverage: config.testrpcCoverage,
    ropsten: {
      provider: () => new HDWalletProvider(privKeys, `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`),
      network_id: 3,
      gas: 723783,
      gasPrice: 50000000000 // Specified in Wei
    },
    kovan: {
      provider: () => new HDWalletProvider(privKeys, `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`),
      network_id: 42,
      gas: 5323783,
      gasPrice: 50000000000 // Specified in Wei
    },
    live: {
      provider: () => new HDWalletProvider(privKeys, `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`),
      network_id: 1,
      gas: 6000000,
      gasPrice: 60000000000 // Specified in Wei
    }
  },
  compilers: {
    solc: {
      version: '^0.5.15',
      settings: {
        optimizer: {
          enabled: false
        }
      }
    }
  },
  mocha: {
    enableTimeouts: false
  }
};
