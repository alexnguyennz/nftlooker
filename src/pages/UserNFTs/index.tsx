import { useEffect, useState } from 'react';

// Router
import { useLocation, useParams } from 'react-router-dom';

// State
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
} from '../../state/loading/loadingSlice';
// import { testnetsState } from '../../state/testnets/testnetsSlice';
import { changeTab } from '../../state/tab/tabSlice';
import { changeChainTab, chainTabState } from '../../state/tab/tabSlice';

// Data
import chains from '../../data';

// Components
import NoNFTs from '../../components/NoNFTs/NoNFTs';
import ChainTab from '../../components/ChainTab/UserChainTab';
import UserChainData from '../../components/ChainTab/ChainData/UserChainData';

import {
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';

export default function UserNFTs() {
  // React Router
  const params = useParams();
  const location = useLocation();

  // State
  const dispatch = useDispatch();
  const chainTab = useSelector(chainTabState);
  const [chainTabSet, setChainTabSet] = useState(false);

  const [chainsState, setChainsState] = useState(chains);

  const [noNfts, setNoNfts] = useState(false);

  useEffect(() => {
    document.title = `NFT Looker. ${params.walletAddress}`;

    return () => {
      dispatch(viewIsNotLoading());
      document.title = `NFT Looker. A simple NFT viewer.`;
    };
  }, []);

  useEffect(() => {
    //console.log('current chainTab', chainTab);
  }, [chainTab]);

  useEffect(() => {
    //console.log('chains state', chainsState);

    if (Object.values(chainsState).every((chain) => chain.loaded)) {
      dispatch(viewIsNotLoading());

      // check for any NFTs
      if (Object.values(chainsState).every((chain) => !chain.total)) {
        setNoNfts(true);
      } 
    } else {
      dispatch(viewIsLoading());
      setNoNfts(false);
    }
  }, [chainsState]);

  function handleChainState(data) {
    setChainsState((prevState) => ({ ...prevState, [data.abbr]: data }));

    if (data.total > 0 && !chainTabSet) {
      dispatch(changeChainTab(data.order));
      setChainTabSet(true);
    }
  }

  return (
    <>
      <Tabs
        index={chainTab}
        onChange={(index) => dispatch(changeChainTab(index))}
        align="center"
        variant="solid-rounded"
        colorScheme="gray"
        isLazy={false}
      >
        <TabList>
          <div className="flex items-center">
            {Object.keys(chainsState).map((chain, idx) => (
              <ChainTab chain={chainsState[chain]} idx={idx} key={idx} />
            ))}
          </div>
        </TabList>

        <TabPanels>
          {Object.keys(chainsState).map((chain) => (
            <TabPanel key={chain} paddingX="0">
              <UserChainData
                chain={chain}
                wallet={params.walletAddress}
                chainTabSet={chainTabSet}
                onChainTabSet={(bool) => setChainTabSet(bool)}
                chains={chainsState}
                onChains={(data) => handleChainState(data)}
                location={location}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <NoNFTs noNfts={noNfts} />
    </>
  );
}
