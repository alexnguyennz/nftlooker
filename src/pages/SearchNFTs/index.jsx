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
import ChainTab from '../../components/ChainTab/ChainTab';
import SearchChainTab from '../../components/ChainTab/SearchChainTab';
import ChainData from '../../components/ChainTab/ChainData/ChainData';

import SearchChainData from '../../components/ChainTab/ChainData/SearchChainData';
import SearchChainDataTest from '../../components/ChainTab/ChainData/SearchChainDataTest';

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

import ChainIcon from '../../components/ChainIcon/ChainIcon';

import toast from '../../components/Toast/Toast';

export function SearchNFTs() {
  // React Router
  const params = useParams();

  // State
  const dispatch = useDispatch();
  const chainTab = useSelector(chainTabState);
  const [chainTabSet, setChainTabSet] = useState(false);

  const [chainsState, setChainsState] = useState(chains);

  const [noNfts, setNoNfts] = useState('');

  useEffect(() => {
    console.log('chain tab set', chainTabSet);
  }, [chainTabSet]);

  const [test, setTest] = useState(1);

  useEffect(() => {
    dispatch(changeTab(1)); // manually set to Search tab on search routes

    dispatch(viewIsLoading());

    // reset UI
    dispatch(changeChainTab(-1));
    setNoNfts('');

    document.title = `NFT Looker. Search for ${params.q}`;

    return () => {
      dispatch(viewIsNotLoading());
      document.title = `NFT Looker. A simple NFT viewer.`;
    };
  }, []);

  useEffect(() => {
    console.log('chains state', chainsState);
  }, [chainsState]);

  function handleChainsState(data) {
    console.log('data handle', data);

    setChainsState({ ...chainsState, [data.abbr]: data });

    if (Object.values(chainsState).every((chain) => chain.loaded)) {
      dispatch(viewIsNotLoading());
    }

    Object.values(chainsState).every((chain) => {
      console.log('chain every', chain);
      return chain.loaded;
    });
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
            <TabPanel key={chain} value={idx}>
              <SearchChainData
                chain={chain}
                q={params.q}
                chainTabSet={chainTabSet}
                onChainTabSet={(bool) => setChainTabSet(bool)}
                chains={chainsState}
                onChains={handleChainsState}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <NoNFTs noNfts={noNfts} />
    </>
  );
}
