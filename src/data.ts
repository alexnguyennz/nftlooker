const chains = {
  eth: {
    name: 'Ethereum',
    abbr: 'eth',
    order: 0,
    data: [],
    loaded: false,
    count: 0,
    total: 0,
  },
  matic: {
    name: 'Polygon',
    abbr: 'matic',
    order: 1,
    data: [],
    loaded: false,
    count: 0,
    total: 0,
  },
  binance: {
    name: 'Binance',
    abbr: 'binance',
    order: 2,
    data: [],
    loaded: false,
    count: 0,
    total: 0,
  },
  avalanche: {
    name: 'Avalanche',
    abbr: 'avalanche',
    order: 3,
    data: [],
    loaded: false,
    count: 0,
    total: 0,
  },
  fantom: {
    name: 'Fantom',
    abbr: 'fantom',
    order: 4,
    data: [],
    loaded: false,
    count: 0,
    total: 0, // may be issue
  },
};

export default chains;

/* 
export const initialCollections = {
  mainnets: {
    eth: {
      name: 'Ethereum',
      order: 0,
    },
    matic: {
      name: 'Polygon',
      order: 1,
    },
    binance: {
      name: 'Binance',
      order: 2,
    },
    avalanche: {
      name: 'Avalanche',
      order: 3,
    },
    fantom: {
      name: 'Fantom',
      order: 4,
    },
  },
  testnets: {
    ropsten: {
      name: 'Ropsten', // ETH
      order: 5,
    },
    rinkeby: {
      name: 'Rinkeby', // ETH
      order: 6,
    },
    goerli: {
      name: 'Goerli', // ETH
      order: 7,
    },
    kovan: {
      name: 'Kovan', // ETH
      order: 8,
    },
    mumbai: {
      name: 'Mumbai', // MATIC
      order: 9,
    },
    '0x61': {
      name: 'Testnet', // BSC
      order: 10,
    },
    '0xa869': {
      name: 'Fuji', // AVAX
      order: 11,
    },
  },
};

*/
