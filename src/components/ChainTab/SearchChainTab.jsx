import { Tab, Tooltip, Spinner } from '@chakra-ui/react';

import { NFTCollection } from '../NFTCollection/NFTCollection';
import ChainIcon from '../ChainIcon/ChainIcon';

export default function SearchChainTab(props) {
  const chain = props.chain;

  const chains = props.chains;

  const abbr = chain.abbr;

  const noNftsFound = !chains[abbr].count;

  console.log('props in tab', props.chains);

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
          {chain.name} {chains[abbr].count > 0 && `(${chains[abbr].count})`}
        </span>
        {!chains[abbr].loaded && <Spinner size="sm" />}
      </Tab>
    </Tooltip>
  );
}
