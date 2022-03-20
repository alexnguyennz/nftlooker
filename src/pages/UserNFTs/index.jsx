import React, { useEffect, useState, Profiler } from 'react';

import { useLocation, useParams } from 'react-router-dom';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
  loadingState,
} from '../../state/loading/loadingSlice';
import { testnetsState } from '../../state/testnets/testnetsSlice';

// React Query
import axios from 'axios';
import { useQueries } from 'react-query';

import { NFTCollection } from '../../components/NFTCollection/NFTCollection';

// Chakra UI
import {
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  Flex,
  Box,
  Spinner,
} from '@chakra-ui/react';

import ChainIcon from '../../components/ChainIcon/ChainIcon';

/*import { ScrollMenu } from 'react-horizontal-scrolling-menu';

import {
  onWheel,
  Arrow,
  LeftArrow,
  RightArrow,
} from '../../components/ScrollableTab/ScrollableTab'; */

// UTILS
import toast from '../../components/Toast/Toast';

import chains from '../../data';

export function UserNFTs() {
  // React Router
  let location = useLocation();
  let params = useParams();

  // React Redux
  const dispatch = useDispatch();
  const testnets = useSelector(testnetsState);
  const loading = useSelector(loadingState);

  const toastInstance = useToast();

  const [noNfts, setNoNfts] = useState('');

  const [chainTab, setChainTab] = useState(null);
  let chainTabSet = false;

  useEffect(() => {
    // document.title = `NFT Looker. ${params.walletAddress}`;
    return () => {
      dispatch(viewIsNotLoading());
    };
  }, []);

  let chainQueries = [];
  // React Query
  if (!testnets) {
    chainQueries.push(
      useQueries(
        Object.keys(chains).map((chain) => {
          return {
            queryKey: [params.walletAddress, chain], // location
            queryFn: ({ signal }) => fetchNfts(chain, signal),
            placeholderData: {
              [chain]: chains[chain],
            },
          };
        })
      )
    );
  }

  useEffect(() => {
    if (chainQueries[0].some((query) => query.isFetching)) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());
    }

    console.log('chain queries', chainQueries);
  }, [chainQueries]);

  useEffect(() => {
    // if loaded is true (all NFT data has been set in state), find out if there are any NFTs or not
    if (!loading) {
      if (testnets) {
        const noNfts =
          Object.values(chains['mainnets']).every(
            (collection) => collection.count == 0
          ) &&
          Object.values(chains['testnets']).every(
            (collection) => collection.count == 0
          );

        setNoNfts(noNfts);
      } else {
        setNoNfts(
          Object.values(chains).every((collection) => collection.count == 0)
        );
      }
    }
  }, [loading]);

  async function fetchNfts(chain, signal) {
    try {
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

      // count the number of NFTs
      let nftCount = 0;

      Object.keys(data).forEach((item) => {
        nftCount += data[item].length;
      });

      // set the chain tab to one that has NFTs and only set it once i.e. the first loaded tab
      if (nftCount > 0 && !chainTabSet) {
        setChainTab(chains[chain].order);
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
    } catch (err) {
      //console.log(err);
    }
  }

  function RenderData(props) {
    const chain = props.chain;

    // find relevant data in chainQueries array based on chain name
    const query = chainQueries[0].find((query) => {
      const queryChain = Object.keys(query.data)[0];
      return queryChain == chain;
    });

    const queryData = query.data[chain];

    // queryData.loaded && Object.keys(queryData.data).length !== 0 &&

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

  function ChainTab(props) {
    const chain = props.chain;

    // find relevant data in chainQueries array based on chain name
    const query = chainQueries[0].find((query) => {
      const queryChain = Object.keys(query.data)[0];
      return queryChain == chain;
    });

    const queryData = query.data[chain];

    //const noNftsFound = !collections[chain].count;
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
          {!queryData.loaded && <Spinner size="sm" label="loading" />}
        </Tab>
      </Tooltip>
    );
  }

  return (
    <>
      <Tabs
        index={chainTab}
        onChange={(index) => setChainTab(index)}
        align="center"
        variant="solid-rounded"
        colorScheme="gray"
        isLazy={true}
        lazyBehavior={true}
      >
        <TabList>
          {chainQueries[0].map((query, idx) => {
            const chain = Object.keys(query.data)[0];

            return <ChainTab chain={chain} idx={idx} key={idx} />;
          })}
        </TabList>

        <TabPanels>
          {!noNfts &&
            chainQueries[0].map((query, idx) => {
              const chain = Object.keys(query.data)[0];

              return (
                <TabPanel value={idx} key={chain}>
                  <RenderData chain={chain} />
                </TabPanel>
              );
            })}
        </TabPanels>
      </Tabs>
      {!loading && noNfts && (
        <p className="mt-10 font-bold text-2xl text-center ">
          No NFTs found :(
          <img
            src="/img/sad-chocobo.png"
            alt="sad Moogle art"
            className="mx-auto mt-10"
            width="250"
          />
        </p>
      )}
    </>
  );
}
