export function explorer(chain) {
  switch (chain) {
    case 'eth':
      return 'etherscan.io';
    case 'matic':
      return 'polygonscan.com';
    case 'binance':
      return 'bscscan.com';
    case 'avalanche':
      return 'snowtrace.io';

    case 'fantom':
      return 'ftmscan.com';
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
  }
}
