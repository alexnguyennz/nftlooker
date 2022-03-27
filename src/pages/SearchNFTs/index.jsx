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
    dispatch(changeTab(1)); // manually set to Search tab on search routes

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
    /*if (queries.some((query) => query.isFetching)) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());
    }*/

    // console.log('chain state useEffect');

    console.log('chains state', chainsState);

    Object.values(chainsState).every((chain) => {
      console.log('chain loaded every', chain.loaded);
      console.log('chain', chain);
      return chain.loaded;
    });

    if (Object.values(chainsState).every((chain) => chain.loaded)) {
      console.log('everything loaded');
      dispatch(viewIsNotLoading());
    } else {
      dispatch(viewIsLoading());
    }

    // this needs testing
    /*setNoNfts(
        Object.values(queries).every((collection) => {
          const chain = Object.values(collection.data)[0];
          return chain.count === 0;
        })
      ); */
    //console.log('chain queries', queries);
  }, [chainsState]);

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
            {Object.keys(chains).map((chain, idx) => (
              <SearchChainTab
                chain={chains[chain]}
                idx={idx}
                key={idx}
                chains={chainsState}
              />
            ))}
          </div>
        </TabList>

        <TabPanels>
          {Object.keys(chains).map((chain, idx) => (
            <TabPanel key={chain} value={idx}>
              <SearchChainData
                chain={chain}
                q={params.q}
                chainTabSet={chainTabSet}
                onChainTabSet={() => setChainTabSet(true)}
                chains={chainsState}
                onChains={(data) => setChainsState(data)}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <NoNFTs noNfts={noNfts} />
    </>
  );
}
