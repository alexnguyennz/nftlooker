import { useEffect, useState } from 'react';

import { Tab, Tooltip, Spinner } from '@chakra-ui/react';

import { NFTCollection } from '../NFTCollection/NFTCollection';
import ChainIcon from '../ChainIcon/ChainIcon';

export default function SearchChainTab(props) {
  const chain = props.chain;

  const abbr = chain.abbr;

  console.log('props, chains', props.chains);
  console.log('count', props.chains[abbr].count);

  const noNftsFound = !props.chains[abbr].count;

  const [nfts, setNfts] = useState(props.chains);

  //console.log('chain', abbr, 'is disabled', noNftsFound);

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
        <ChainIcon chain={abbr} />
        <span>
          {chain.name}{' '}
          {props.chains[abbr].count > 0 && `(${props.chains[abbr].count})`}
        </span>
        {!props.chains[abbr].loaded && <Spinner size="sm" />}
      </Tab>
    </Tooltip>
  );
}
