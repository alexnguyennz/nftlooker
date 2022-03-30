import { Tab, Tooltip, Spinner } from '@chakra-ui/react';

import ChainIcon from '../ChainIcon/ChainIcon';

export default function ChainTab(props) {
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
        className={`items-center space-x-2 ${noNftsFound && `css-1ltezim`}`}
      >
        <ChainIcon chain={chain} />
        <span>
          {data.name} {data.count > 0 && `(${data.count})`}
        </span>
        {!data.loaded && <Spinner size="sm" />}
      </Tab>
    </Tooltip>
  );
}
