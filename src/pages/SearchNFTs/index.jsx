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
import { useQueries } from 'react-query';
import chains from '../../data';

// Components
import NoNFTs from '../../components/NoNFTs/NoNFTs';
import ChainTab from '../../components/ChainTab/ChainTab';
import ChainData from '../../components/ChainTab/ChainData/ChainData';

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
  const location = useLocation();

  // State
  const dispatch = useDispatch();
  const chainTab = useSelector(chainTabState);
  let chainTabSet = false;
  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);

  const [noNfts, setNoNfts] = useState('');

  const toastInstance = useToast();

  useEffect(() => {
    dispatch(changeTab(1)); // manually set to Search tab on search routes

    document.title = `NFT Looker. Search for ${params.q}`;

    return () => {
      dispatch(viewIsNotLoading());
      document.title = `NFT Looker. A simple NFT viewer.`;
    };
  }, []);

  let queries = useQueries(
    Object.keys(chains).map((chain) => {
      return {
        queryKey: [location, chain], // location
        queryFn: ({ signal }) => fetchNfts(chain, signal),
        placeholderData: {
          [chain]: chains[chain],
        },
      };
    })
  );

  useEffect(() => {
    if (queries.some((query) => query.isFetching)) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());

      setNoNfts(
        Object.values(queries).every((collection) => {
          const chain = Object.values(collection.data)[0];
          return chain.count === 0;
        })
      );
    }

    //console.log('chain queries', queries);
  }, [queries]);

  async function fetchNfts(chain, signal) {
    // reset UI
    dispatch(changeChainTab(-1));
    setNoNfts('');

    return await axios(
      `/api/search?chain=${chain}&q=${params.q}&filter=${searchFilter}&limit=${searchLimit}&offset=0`,
      {
        signal,
      }
    )
      .then(({ data }) => {
        const nftCount = Object.values(data).flat().length;

        // set the chain tab to one that has NFTs and only set it once i.e. the first loaded tab
        if (nftCount > 0 && !chainTabSet) {
          dispatch(changeChainTab(chains[chain].order));
          chainTabSet = true;
        }

        return {
          [chain]: {
            name: chains[chain]['name'],
            order: chains[chain]['order'],
            data,
            loaded: true,
            count: nftCount,
          },
        };
      })
      .catch((err) => {
        if (err.message == 'canceled') {
          toast(toastInstance, 'error', 'Cancelled.');
        } else if (err.message == 'Request failed with status code 500') {
          toast(
            toastInstance,
            'error',
            'Error - likely invalid address or search.'
          );
        } else {
          toast(toastInstance, 'error', 'Server error', `${err.message}`);
        }

        return {
          [chain]: {
            name: chains[chain]['name'],
            order: chains[chain]['order'],
            data: {},
            loaded: true,
            count: 0,
          },
        };
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
            {queries.map((query, idx) => (
              <ChainTab chain={query.data} idx={idx} key={idx} />
            ))}
          </div>
        </TabList>

        <TabPanels>
          {queries.map((query, idx) => (
            <TabPanel key={Object.keys(query.data)[0]} value={idx}>
              <ChainData chain={query.data} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <NoNFTs noNfts={noNfts} />
    </>
  );
}
