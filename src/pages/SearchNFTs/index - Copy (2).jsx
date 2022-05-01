import { useEffect, useState } from 'react';

// Router
import { useLocation, useParams } from 'react-router-dom';

// State
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
} from '../../state/loading/loadingSlice';
import { testnetsState } from '../../state/testnets/testnetsSlice';
import { changeTab } from '../../state/tab/tabSlice';
import { changeChainTab, chainTabState } from '../../state/tab/tabSlice';
import {
  searchLimitState,
  searchFilterState,
} from '../../state/search/searchSlice';

// Data
import axios from 'axios';
import { useQueries, useInfiniteQuery, useQuery } from 'react-query';
import chains from '../../data';

// Components
import NoNFTs from '../../components/NoNFTs/NoNFTs';
import SearchChainTab from '../../components/ChainTab/SearchChainTab';

import SearchChainData from '../../components/ChainTab/ChainData/SearchChainData';

import {
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

export function SearchNFTs() {
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
    dispatch(changeTab(1)); // manually set to Search tab on search routes

    // need this

    // reset UI
    //setChainsState(chains);
    //dispatch(changeChainTab(-1));
    //setNoNfts(false);

    document.title = `NFT Looker. Search for ${params.q}`;

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
        lazyBehavior={false}
      >
        <TabList>
          <div className="flex items-center">
            {Object.keys(chainsState).map((chain, idx) => (
              <SearchChainTab chain={chainsState[chain]} idx={idx} key={idx} />
            ))}
          </div>
        </TabList>

        <TabPanels>
          {Object.keys(chainsState).map((chain, idx) => (
            <TabPanel key={chain} value={idx} paddingX="0">
              <SearchChainData
                chain={chain}
                q={params.q}
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
