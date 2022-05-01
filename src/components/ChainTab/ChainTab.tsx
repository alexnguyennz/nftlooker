import { Tab, Tooltip, Spinner } from '@chakra-ui/react';

import ChainIcon from './ChainIcon/ChainIcon';

interface ChainProps {
  name: string;
  abbr: string;
  loaded: boolean;
  count: number;
  order: number;
  total: number;
}

interface Props {
  chain: ChainProps;
  idx: number;
  key: React.Key;
}

export default function ChainTab(props: Props) {
  const chain = props.chain;

  const nftCount = chain.total;

  return (
    <Tooltip
      label={!nftCount && 'No NFTs found.'}
      aria-label="NFT count tooltip"
      openDelay={750}
      shouldWrapChildren
    >
      <Tab
        isDisabled={!nftCount}
        value={props.idx}
        className={`space-x-1 ${!nftCount && `css-1ltezim`}`}
      >
        <ChainIcon chain={chain.abbr} />
        <span className="tab-name">{chain.name}</span>
        <span className="tab-count">{nftCount > 0 && `(${nftCount})`}</span>
        {!chain.loaded && (
          <span className="mt-2">
            <Spinner size="sm" />
          </span>
        )}
      </Tab>
    </Tooltip>
  );
}
