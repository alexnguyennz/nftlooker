import { useEffect, useState } from 'react';

import { Tab, Tooltip, Spinner } from '@chakra-ui/react';

import { NFTCollection } from '../NFTCollection/NFTCollection';
import ChainIcon from '../ChainIcon/ChainIcon';

export default function SearchChainTab(props) {
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
        className={`items-center space-x-2 ${!nftCount && `css-1ltezim`}`}
      >
        <ChainIcon chain={chain.abbr} />
        <span>
          {chain.name} {nftCount > 0 && `(${nftCount})`}
        </span>
        {!chain.loaded && <Spinner size="sm" />}
      </Tab>
    </Tooltip>
  );
}
