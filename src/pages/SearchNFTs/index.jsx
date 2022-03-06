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
import { useQueries } from 'react-query';

import {
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
} from '@chakra-ui/react';

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

import { initialCollections } from '../../data';

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
        `/api/search?chain=${chain}&q=${params.q}&filter=${searchFilter}&limit=${searchLimit}`,
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
      <Profiler id={`profiler-${chain}`} onRender={profilerCallback}>
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
      </Profiler>
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

export function SearchNFTsTest(props) {
  const dispatch = useDispatch();

  const testnets = useSelector(testnetsState);
  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);

  // state

  const [noNfts, setNoNfts] = useState('');

  const [loaded, setLoaded] = useState(false);

  const [chainTab, setChainTab] = useState(1);

  const [allCollections, setAllCollections] = useState({
    eth: {
      name: 'Ethereum',
      loaded: false,
      data: {},
      count: 0,
      order: 0,
    },
    matic: {
      name: 'Polygon',
      loaded: false,
      data: {},
      count: 0,
      order: 1,
    },
    binance: {
      name: 'Binance',
      loaded: false,
      data: {},
      count: 0,
      order: 2,
    },
    avalanche: {
      name: 'Avalanche',
      loaded: false,
      data: {},
      count: 0,
      order: 3,
    },
    fantom: {
      name: 'Fantom',
      loaded: false,
      data: {},
      count: 0,
      order: 4,
    },
  });

  const [testnetCollections, setTestnetCollections] = useState({
    ropsten: {
      name: 'Ropsten', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 0,
    },
    rinkeby: {
      name: 'Rinkeby', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 1,
    },
    goerli: {
      name: 'Goerli', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 2,
    },
    kovan: {
      name: 'Kovan', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 3,
    },
    mumbai: {
      name: 'Mumbai', // MATIC
      loaded: false,
      data: {},
      count: 0,
      order: 5,
    },
    '0x61': {
      name: 'Testnet', // BSC
      loaded: false,
      data: {},
      count: 0,
      order: 4,
    },

    '0xa869': {
      name: 'Fuji', // AVAX
      loaded: false,
      data: {},
      count: 0,
      order: 6,
    },
  });

  // React Router
  let location = useLocation();
  let params = useParams();

  const toastInstance = useToast();

  const abortController = new AbortController();

  async function cancelRequests() {
    console.log('running cancelrequests');
  }

  useEffect(() => {
    dispatch(changeTab(1));

    return () => {
      abortController.abort();

      cancelRequests();

      dispatch(viewIsNotLoading());
    };
  }, []);

  // set address using address param
  useEffect(() => {
    if (params.q) {
      getData();
    }

    document.title = `nft looker. Search for ${params.q}`;
  }, [location]);

  useEffect(() => {
    // if loaded is true (all NFT data has been set in state), find out if there are any NFTs or not
    if (loaded) {
      if (testnets) {
        const noNfts =
          Object.values(allCollections).every(
            (collection) => collection.count == 0
          ) &&
          Object.values(testnetCollections).every(
            (collection) => collection.count == 0
          );

        setNoNfts(noNfts);
      } else {
        setNoNfts(
          Object.values(allCollections).every(
            (collection) => collection.count == 0
          )
        );
      }
    }
  }, [loaded]);

  useEffect(() => {
    //console.log(allCollections);
  }, [allCollections]);

  async function fetchTestnetNfts(chain) {
    await axios
      .get(
        `/api/search?chain=${chain}&q=${params.q}&filter=${searchFilter}&limit=${searchLimit}`,
        {
          signal: abortController.signal,
        }
      )
      .then((response) => {
        const data = response.data;

        // count the number of NFTs
        let nftCount = 0;

        Object.keys(data).forEach((item) => {
          nftCount += data[item].length;
        });

        // set the chain tab to one that has NFTs
        if (nftCount > 0) {
          setChainTab(testnetCollections[chain].order);
        }

        //console.log('chains', Object.values(chains));

        setTestnetCollections((prevState) => ({
          ...prevState,
          [chain]: {
            ...prevState[chain],
            data: data,
            loaded: true,
            count: nftCount,
          },
        }));
      })
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
  }

  async function fetchNfts(chain) {
    await axios
      .get(
        `/api/search?chain=${chain}&q=${params.q}&filter=${searchFilter}&limit=${searchLimit}`,
        {
          signal: abortController.signal,
        }
      )
      .then((response) => {
        const data = response.data;

        // count the number of NFTs
        let nftCount = 0;

        Object.keys(data).forEach((item) => {
          nftCount += data[item].length;
        });

        // set the chain tab to one that has NFTs
        if (nftCount > 0) {
          setChainTab(allCollections[chain].order);
        }

        //console.log('chains', Object.values(chains));

        setAllCollections((prevState) => ({
          ...prevState,
          [chain]: {
            ...prevState[chain],
            data: data,
            loaded: true,
            count: nftCount,
          },
        }));
      })
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
  }

  async function getData() {
    // reset loading states
    dispatch(viewIsLoading());
    setLoaded(false);

    let promises;

    if (testnets) {
      promises = [
        fetchNfts('eth'),
        fetchNfts('matic'),
        fetchNfts('binance'),
        fetchNfts('avalanche'),
        fetchNfts('fantom'),
        fetchTestnetNfts('ropsten'),
        fetchTestnetNfts('rinkeby'),
        fetchTestnetNfts('goerli'),
        fetchTestnetNfts('kovan'),
        fetchTestnetNfts('0x61'),
        fetchTestnetNfts('mumbai'),
        fetchTestnetNfts('0xa869'),
      ];
    } else {
      promises = [
        fetchNfts('eth'),
        fetchNfts('matic'),
        fetchNfts('binance'),
        fetchNfts('avalanche'),
        fetchNfts('fantom'),
      ];
    }

    Promise.all(promises)
      .then(() => {
        dispatch(viewIsNotLoading());
        setLoaded(true);
      })
      .catch((err) => {
        toast(toastInstance, 'error', "Couldn't contact server.", `${err}`);
      });
  }

  const RenderData = React.memo(function RenderData(props) {
    const chain = props.chain;
    const collections = props.collections;

    return (
      <Profiler id={`profiler-${chain}`} onRender={profilerCallback}>
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
      </Profiler>
    );
  });

  function ChainTab(props) {
    const chain = props.chain;
    const collections = props.collections;
    const idx = props.index;

    function ChainIcon() {
      switch (chain) {
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

    // bool state if count is 0 or not (no NFTs)
    const disabled = !collections[chain].count;

    return (
      <Tab
        onChange={() => setChainTab(idx)}
        title={
          !collections[chain].count
            ? 'No NFTs found.'
            : `${collections[chain].count} NFTs found.`
        }
        isDisabled={disabled}
        value={idx}
        className={disabled && `css-1ltezim`}
      >
        <div className="flex flex-col md:flex-row">
          <span className="md:mr-2 text-center">
            <ChainIcon />
          </span>
          {collections[chain].name}{' '}
          {collections[chain].count > 0 && `(${collections[chain].count})`}
        </div>
      </Tab>
    );
  }

  return (
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
        {loaded && !noNfts && (
          <TabList>
            {Object.keys(allCollections).map((chain, idx) => (
              <ChainTab
                chain={chain}
                collections={allCollections}
                index={idx}
                key={idx}
              />
            ))}
          </TabList>
        )}

        {testnets && loaded && !noNfts && (
          <TabList
            sx={{
              scrollbarWidth: '40px',
              '::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {Object.keys(testnetCollections).map((chain, idx) => (
              <ChainTab
                chain={chain}
                collections={testnetCollections}
                index={idx}
                key={idx}
              />
            ))}
          </TabList>
        )}

        <TabPanels>
          {loaded &&
            !noNfts &&
            Object.keys(allCollections).map((chain, idx) => (
              <TabPanel value={idx} key={chain}>
                <RenderData chain={chain} collections={allCollections} />
              </TabPanel>
            ))}

          {testnets &&
            loaded &&
            !noNfts &&
            Object.keys(testnetCollections).map((chain, idx) => (
              <TabPanel value={idx} key={chain}>
                <RenderData chain={chain} collections={testnetCollections} />
              </TabPanel>
            ))}
        </TabPanels>
      </Tabs>

      {loaded && noNfts && (
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
