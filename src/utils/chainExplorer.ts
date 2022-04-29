export function explorer(chain) {
  switch (chain) {
    case 'eth':
    case '1':
      return 'etherscan.io';
    case 'polygon':
    case '137':
      return 'polygonscan.com';
    case 'bsc':
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
    case 'polygon':
      return 'Polygon';
    case 'bsc':
      return 'Binance';
    case 'avalanche':
      return 'Avalanche';
    case 'fantom':
      return 'Fantom';
    default:
      return 'Ethereum';
  }
}
