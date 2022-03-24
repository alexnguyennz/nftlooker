function Ethereum() {
  return (
    <img
      src="/icons/ethereum.svg"
      alt="Ethereum icon"
      width="16"
      className="inline"
    />
  );
}

function Polygon() {
  return (
    <img
      src="/icons/polygon.svg"
      alt="Polygon icon"
      width="24"
      className="inline"
    />
  );
}

function Binance() {
  return (
    <img
      src="/icons/binance.svg"
      alt="Binance Smart Chain icon"
      width="24"
      className="inline"
    />
  );
}

function Avalanche() {
  return (
    <img
      src="/icons/avalanche.svg"
      alt="Avalanche icon"
      width="23"
      className="inline"
    />
  );
}

function Fantom() {
  return (
    <img
      src="/icons/fantom.svg"
      alt="Fantom icon"
      width="24"
      className="inline"
    />
  );
}

export default function ChainIcon(props) {
  switch (props.chain) {
    case 'eth':
      return <Ethereum />;
    case 'matic':
      return <Polygon />;
    case 'binance':
      return <Binance />;
    case 'avalanche':
      return <Avalanche />;
    case 'fantom':
      return <Fantom />;
    case 'ropsten':
      return <Ethereum />;
    case 'rinkeby':
      return <Ethereum />;
    case 'goerli':
      return <Ethereum />;
    case 'kovan':
      return <Ethereum />;
    case 'mumbai':
      return <Polygon />;
    case '0x61':
      return <Binance />;
    case '0xa869':
      return <Avalanche />;
    default:
      return <Ethereum />;
  }
}
