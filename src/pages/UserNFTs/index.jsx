import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
  loadingState,
} from '../../state/loading/loadingSlice';
import { testnetsState } from '../../state/testnets/testnetsSlice';
import { changeChainTab, chainTabState } from '../../state/tab/tabSlice';

// React Query
import axios from 'axios';
import { useQueries, QueryClient } from 'react-query';

// Components
import NoNFTs from '../../components/NoNFTs/NoNFTs';
import { NFTCollection } from '../../components/NFTCollection/NFTCollection';

// Chakra UI
import {
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from '@chakra-ui/react';

import { EmailIcon } from '@chakra-ui/icons';

import {
  EmailShareButton,
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
} from 'react-share';

import ChainIcon from '../../components/ChainIcon/ChainIcon';

// UTILS
import toast from '../../components/Toast/Toast';
import chains from '../../data';
import findQuery from '../../utils/findQuery';

import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import {
  onWheel,
  Arrow,
  LeftArrow,
  RightArrow,
} from '../../components/ScrollableTab/ScrollableTab';

export function UserNFTs() {
  // React Router
  let params = useParams();

  // React Redux
  const dispatch = useDispatch();
  const chainTab = useSelector(chainTabState);
  let chainTabSet = false;

  const [noNfts, setNoNfts] = useState('');

  const toastInstance = useToast();

  useEffect(() => {
    document.title = `NFT Looker. ${params.walletAddress}`;

    console.log('remount');
    return () => {
      dispatch(viewIsNotLoading());
      document.title = `NFT Looker. A simple NFT viewer.`;
    };
  }, []);

  // React Query
  let chainQueries = useQueries(
    Object.keys(chains).map((chain) => {
      return {
        queryKey: [params.walletAddress, chain], // location
        queryFn: ({ signal }) => fetchNfts(chain, signal),
        placeholderData: {
          [chain]: chains[chain],
        },
      };
    })
  );

  useEffect(() => {
    if (chainQueries.some((query) => query.isFetching)) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());

      setNoNfts(
        Object.values(chainQueries).every((collection) => {
          const chain = Object.values(collection.data);
          return chain[0].count == 0;
        })
      );
    }

    console.log('chain queries', chainQueries);
  }, [chainQueries]);

  async function fetchNfts(chain, signal) {
    const { data } = await axios(
      `/api/nfts?chain=${chain}&address=${params.walletAddress}`,
      {
        signal,
      }
    ).catch((err) => {
      console.log('err', err.message);
      if (err.message == 'canceled') {
        toast(toastInstance, 'error', 'Cancelled.');
      } else if (err.message == 'Request failed with status code 500') {
        toast(toastInstance, 'error', 'Invalid address.');
      } else {
        toast(toastInstance, 'error', 'Server error', `${err.message}`);
      }
    });

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
  }

  function ChainTab(props) {
    const chain = props.chain;

    const queryData = findQuery(chainQueries, chain);

    const noNftsFound = !queryData.count;

    return (
      <Tooltip
        label={
          noNftsFound ? 'No NFTs found.' : `${queryData.count} NFTs found.`
        }
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
            {queryData.name} {queryData.count > 0 && `(${queryData.count})`}
          </span>
          {!queryData.loaded && <Spinner size="sm" />}
        </Tab>
      </Tooltip>
    );
  }

  function RenderData(props) {
    const chain = props.chain;

    const queryData = findQuery(chainQueries, chain);

    return (
      <div className="grid gap-5">
        {Object.keys(queryData.data).map((collection) => (
          <NFTCollection
            key={collection}
            collection={queryData.data[collection]}
            chain={chain}
          />
        ))}
      </div>
    );
  }

  function ShareMenu() {
    return (
      <Menu closeOnSelect={false}>
        <MenuButton>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </MenuButton>
        <MenuList minWidth="50px">
          <MenuItem className="space-x-5">
            <EmailShareButton body="body">
              <EmailIcon />
            </EmailShareButton>
            <EmailShareButton body="body">
              <EmailIcon />
            </EmailShareButton>
            <TwitterShareButton body="bodytest">test</TwitterShareButton>
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  return (
    <>
      <Tabs
        index={chainTab}
        onChange={(index) => dispatch(changeChainTab(index))}
        align="center"
        variant="solid-rounded"
        colorScheme="gray"
        isLazy={true}
        lazyBehavior={true}
      >
        <TabList>
          <div className="flex items-center">
            {chainQueries.map((query, idx) => (
              <ChainTab
                chain={Object.keys(query.data)[0]}
                idx={idx}
                key={idx}
              />
            ))}
            <ShareMenu />
          </div>
        </TabList>

        <TabPanels>
          {chainQueries.map((query, idx) => {
            const chain = Object.keys(query.data)[0];

            return (
              <TabPanel key={chain} value={idx}>
                <RenderData chain={chain} />
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>

      <NoNFTs noNfts={noNfts} />
    </>
  );
}
