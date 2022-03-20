import React, { useEffect, useState, Profiler } from 'react';

// React Router
import { useLocation, useParams } from 'react-router-dom';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
  loadingState,
} from '../../state/loading/loadingSlice';
import { testnetsState } from '../../state/testnets/testnetsSlice';
import {
  searchLimitState,
  searchFilterState,
} from '../../state/search/searchSlice';
import { changeTab } from '../../state/tab/tabSlice';

// React Query
import axios from 'axios';
import { useQueries, useInfiniteQuery } from 'react-query';

import {
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

import { ChevronDownIcon } from '@chakra-ui/icons';

import {
  Ethereum,
  Polygon,
  Binance,
  Avalanche,
  Fantom,
} from '../../components/ChainIcons';

import { NFTCollection } from '../../components/NFTCollection/NFTCollection';

// UTILS
import profilerCallback from '../../utils/profilerCallback';
import toast from '../../components/Toast/Toast';

import initialCollections from '../../data';

export function SearchNFTs() {
  // React Router
  let location = useLocation();
  let params = useParams();

  // React Redux
  const dispatch = useDispatch();
  const testnets = useSelector(testnetsState);
  const loading = useSelector(loadingState);
  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);

  const toastInstance = useToast();
  const abortController = new AbortController();

  const [noNfts, setNoNfts] = useState('');

  const [chainTab, setChainTab] = useState(0);

  const [collections, setCollections] = useState(initialCollections);

  useEffect(() => {
    dispatch(changeTab(1));

    return () => {
      abortController.abort();

      dispatch(viewIsNotLoading());
    };
  }, []);

  // set address using address param
  useEffect(() => {
    document.title = `nft looker. Search for ${params.q}`;
  }, [params]);

  useEffect(() => {
    console.log('all collections', collections);
  }, [collections]);

  let chainQueries = [];
  // React Query
  if (!testnets) {
    chainQueries.push(
      useQueries(
        Object.keys(collections.mainnets).map((chain) => {
          return {
            queryKey: [params.walletAddress, chain, location],
            queryFn: () => fetchNfts(chain, true),
          };
        })
      )
    );
  } else {
    const mainnets = Object.keys(collections.mainnets).map((chain) => {
      return {
        queryKey: [params.walletAddress, chain, location],
        queryFn: () => fetchNfts(chain, true),
      };
    });

    const testnets = Object.keys(collections.testnets).map((chain) => {
      return {
        queryKey: [params.walletAddress, chain, location],
        queryFn: () => fetchNfts(chain, false),
      };
    });

    const merged = [...mainnets, ...testnets];

    chainQueries.push(useQueries(merged));
  }

  useEffect(() => {
    if (chainQueries[0].some((query) => query.isFetching)) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());
    }
  }, [chainQueries]);

  useEffect(() => {
    // if loaded is true (all NFT data has been set in state), find out if there are any NFTs or not
    if (!loading) {
      if (testnets) {
        const noNfts =
          Object.values(collections['mainnets']).every(
            (collection) => collection.count == 0
          ) &&
          Object.values(collections['testnets']).every(
            (collection) => collection.count == 0
          );

        setNoNfts(noNfts);
      } else {
        setNoNfts(
          Object.values(collections['mainnets']).every(
            (collection) => collection.count == 0
          )
        );
      }
    }
  }, [loading]);

  async function fetchNfts(chain, isMainnet) {
    const { data } = await axios
      .get(
        `/api/search?chain=${chain}&q=${params.q}&filter=${searchFilter}&limit=${searchLimit}&offset=0`,
        {
          signal: abortController.signal,
        }
      )
      .catch((err) => {
        if (err.message == 'canceled') {
          toast(toastInstance, 'error', 'Fetching NFTs cancelled.');
        } else {
          toast(
            toastInstance,
            'error',
            "Couldn't fetch NFTs from NFT Looker server.",
            `${err.message}`
          );
        }
      });

    // count the number of NFTs
    let nftCount = 0;

    Object.keys(data).forEach((item) => {
      nftCount += data[item].length;
    });

    // set the chain tab to one that has NFTs
    if (isMainnet) {
      if (nftCount > 0) {
        setChainTab(collections['mainnets'][chain].order);
      }

      setCollections((prevState) => ({
        ...prevState,
        mainnets: {
          ...prevState['mainnets'],
          [chain]: {
            ...prevState['mainnets'][chain],
            data: data,
            loaded: true,
            count: nftCount,
          },
        },
      }));
    } else {
      if (nftCount > 0) {
        setChainTab(collections['testnets'][chain].order);
      }

      setCollections((prevState) => ({
        ...prevState,
        testnets: {
          ...prevState['testnets'],
          [chain]: {
            ...prevState['testnets'][chain],
            data: data,
            loaded: true,
            count: nftCount,
          },
        },
      }));
    }

    return data;
  }

  const RenderData = React.memo(function RenderData(props) {
    const chain = props.chain;
    const collections = props.collections;

    return (
      <>
        {collections[chain].loaded &&
          Object.keys(collections[chain].data).length !== 0 && (
            <div className="grid gap-5">
              {Object.keys(collections[chain].data).map((collection) => (
                <NFTCollection
                  key={collection}
                  collection={collections[chain].data[collection]}
                  chain={chain}
                />
              ))}
            </div>
          )}
        {/*<div className="text-center mt-5">
          <Button
            type="submit"
            //onClick={() => fetchNextPage()}
            //disabled={!hasNextPage || isFetchingNextPage}
            //isLoading={isFetchingNextPage}
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="blue"
            rightIcon={<ChevronDownIcon />}
          >
            More
          </Button>

          <Alert status="error">
            <AlertIcon />
            Limit reached.
          </Alert>
            </div>*/}
      </>
    );
  });

  function ChainIcon(props) {
    switch (props.chain) {
      case 'eth':
        return <Ethereum />;
      case 'matic':
        return <Polygon />;
      case 'binance':
        return <Binance />;
      case 'avalanche':
        return <Avalanche />;
      case 'fantom':
        return <Fantom />;
      case 'ropsten':
        return <Ethereum />;
      case 'rinkeby':
        return <Ethereum />;
      case 'goerli':
        return <Ethereum />;
      case 'kovan':
        return <Ethereum />;
      case 'mumbai':
        return <Polygon />;
      case '0x61':
        return <Binance />;
      case '0xa869':
        return <Avalanche />;
      default:
        return <Ethereum />;
    }
  }

  function ChainTab(props) {
    const chain = props.chain;
    const collections = props.collections;
    const idx = props.index;

    // bool state if count is 0 or not (no NFTs)
    const disabled = !collections[chain].count;

    return (
      <Tooltip
        label={
          !collections[chain].count
            ? 'No NFTs found.'
            : `${collections[chain].count} NFTs found.`
        }
        aria-label="NFT count tooltip"
        openDelay={750}
        shouldWrapChildren
      >
        <Tab
          isDisabled={disabled}
          value={idx}
          className={disabled && `css-1ltezim`}
        >
          <div className="flex flex-col md:flex-row">
            <span className="md:mr-2 text-center">
              <ChainIcon chain={chain} />
            </span>
            {collections[chain].name}{' '}
            {collections[chain].count > 0 && `(${collections[chain].count})`}
          </div>
        </Tab>
      </Tooltip>
    );
  }

  return (
    <>
      {/*loaded &&
        chainQueries.map((chain) => (
          //<>{Object.keys(chain.data).map((chain, idx) => console.log(chain))}</>
          <></>
        ))*/}

      <>
        <Tabs
          index={chainTab}
          onChange={(index) => setChainTab(index)}
          align="center"
          variant="solid-rounded" // variant="enclosed"
          colorScheme="gray"
          isLazy={true}
          lazyBehavior={true}
        >
          {!loading && !noNfts && (
            <TabList>
              {Object.keys(collections['mainnets']).map((chain, idx) => (
                <ChainTab
                  chain={chain}
                  collections={collections['mainnets']}
                  index={idx}
                  key={idx}
                />
              ))}
            </TabList>
          )}

          {testnets && !loading && !noNfts && (
            <TabList>
              {Object.keys(collections['testnets']).map((chain, idx) => (
                <ChainTab
                  chain={chain}
                  collections={collections['testnets']}
                  index={idx}
                  key={idx}
                />
              ))}
            </TabList>
          )}

          <TabPanels>
            {!loading &&
              !noNfts &&
              Object.keys(collections['mainnets']).map((chain, idx) => (
                <TabPanel value={idx} key={chain}>
                  {
                    <RenderData
                      chain={chain}
                      collections={collections['mainnets']}
                    />
                  }
                </TabPanel>
              ))}

            {testnets &&
              !loading &&
              !noNfts &&
              Object.keys(collections['testnets']).map((chain, idx) => (
                <TabPanel value={idx} key={chain}>
                  <RenderData
                    chain={chain}
                    collections={collections['testnets']}
                  />
                </TabPanel>
              ))}
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
    </>
  );
}
