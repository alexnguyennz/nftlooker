export function explorer(chain) {
  switch (chain) {
    case 'eth':
    case '1':
      return 'etherscan.io';
    case 'matic':
    case '137':
      return 'polygonscan.com';
    case 'binance':
    case '56':
      return 'bscscan.com';
    case 'avalanche':
    case '43114':
      return 'snowtrace.io';
    case 'fantom':
    case '250':
      return 'ftmscan.com';
    default:
      return 'etherscan.io';
  }
}

export function chainName(chain) {
  switch (chain) {
    case 'eth':
      return 'Ethereum';
    case 'matic':
      return 'Polygon';
    case 'binance':
      return 'Binance';
    case 'avalanche':
      return 'Avalanche';
    case 'fantom':
      return 'Fantom';
    default:
      return 'Ethereum';
  }
}
