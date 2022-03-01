export default function chainExplorer(chain) {
  let chainExplorer;
  let chainName;

  switch (chain) {
    case 'eth':
      chainName = 'Ethereum';
      return 'etherscan.io';
    case 'matic':
      chainName = 'Polygon';

      return 'polygonscan.com';
    case 'binance':
      chainName = 'Binance';
      return 'bscscan.com';
    case 'avalanche':
      chainName = 'Avalanche';
      return 'snowtrace.io';

    case 'fantom':
      chainName = 'Fantom';
      return 'ftmscan.com';
  }
}
