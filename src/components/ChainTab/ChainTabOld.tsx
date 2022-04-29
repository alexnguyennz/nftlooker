import { Tab, Tooltip, Spinner } from '@chakra-ui/react';

import ChainIcon from './ChainIcon/ChainIcon';

interface ChainProps {
  name: string;
  loaded: boolean;
  count: number;
  order: number;
}

interface Chain {
  [key: string]: ChainProps;
}

interface Props {
  chain: Chain;
  idx: number;
  key: React.Key;
}

export default function ChainTab(props: Props) {
  const data = Object.values(props.chain)[0];

  const chain = Object.keys(props.chain)[0];

  const noNftsFound = !data.count;

  return (
    <Tooltip
      label={noNftsFound && 'No NFTs found.'}
      aria-label="NFT count tooltip"
      openDelay={750}
      shouldWrapChildren
    >
      <Tab
        isDisabled={noNftsFound}
        value={props.idx}
        className={`space-x-1 ${noNftsFound && `css-1ltezim`}`}
      >
        <ChainIcon chain={chain} />
        <span className="tab-name">{data.name}</span>{' '}
        <span className="tab-count">{data.count > 0 && `(${data.count})`}</span>
        {!data.loaded && (
          <span className="mt-2">
            <Spinner size="sm" />
          </span>
        )}
      </Tab>
    </Tooltip>
  );
}
