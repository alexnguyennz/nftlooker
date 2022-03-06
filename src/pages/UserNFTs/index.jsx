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

import {
  Ethereum,
  Polygon,
  Binance,
  Avalanche,
  Fantom,
} from '../../components/ChainIcons';

import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import {
  onWheel,
  Arrow,
  LeftArrow,
  RightArrow,
} from '../../components/ScrollableTab/ScrollableTab';

// UTILS
import toast from '../../components/Toast/Toast';

import { initialCollections } from '../../data';

export function UserNFTs() {
  // React Router
  let location = useLocation();
  let params = useParams();

  // React Redux
  const dispatch = useDispatch();
  const testnets = useSelector(testnetsState);
  const loading = useSelector(loadingState);

  const toastInstance = useToast();
  const abortController = new AbortController();

  const [noNfts, setNoNfts] = useState('');

  const [chainTab, setChainTab] = useState(null);
  let chainTabSet = false;

  const [collections, setCollections] = useState(initialCollections);

  // set address using address param
  useEffect(() => {
    return () => {
      abortController.abort();

      dispatch(viewIsNotLoading());
    };
  }, []);

  useEffect(() => {
    document.title = `nft looker. ${params.walletAddress}`;

    setCollections(initialCollections);
  }, [params]);

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
    try {
      const { data } = await axios
        .get(`/api/nfts?chain=${chain}&address=${params.walletAddress}`, {
          signal: abortController.signal,
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

      // count the number of NFTs
      let nftCount = 0;

      Object.keys(data).forEach((item) => {
        nftCount += data[item].length;
      });

      // set the chain tab to one that has NFTs and only set it once i.e. the first loaded tab
      if (isMainnet) {
        if (nftCount > 0 && !chainTabSet) {
          setChainTab(collections['mainnets'][chain].order);
          chainTabSet = true;
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
        if (nftCount > 0 && !chainTabSet) {
          setChainTab(collections['testnets'][chain].order);
          chainTabSet = true;
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
    } catch (err) {
      //console.log(err);
    }
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
          <div className="flex flex-col md:flex-row items-center">
            <span className="md:mr-2 text-center">
              <ChainIcon chain={chain} />
            </span>
            <span className={`mb-1 ${!collections[chain].loaded && `mr-2`}`}>
              {collections[chain].name}{' '}
              {collections[chain].count > 0 && `(${collections[chain].count})`}
            </span>
            {!collections[chain].loaded && (
              <Spinner size="sm" label="chain is loading" />
            )}
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

          {testnets && (
            <TabList overflowX="scroll">
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
            {
              // !loading &&
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
                ))
            }

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

export function UserNFTsTest() {
  // React Router
  let location = useLocation();
  let params = useParams();

  // React Redux
  const dispatch = useDispatch();
  const testnets = useSelector(testnetsState);
  const loading = useSelector(loadingState);

  const toastInstance = useToast();
  const abortController = new AbortController();

  const [noNfts, setNoNfts] = useState('');

  const [chainTab, setChainTab] = useState(0);

  const [collections, setCollections] = useState({
    mainnets: {
      eth: {
        name: 'Ethereum',
        order: 0,
      },
      matic: {
        name: 'Polygon',
        order: 1,
      },
      binance: {
        name: 'Binance',
        order: 2,
      },
      avalanche: {
        name: 'Avalanche',
        order: 3,
      },
      fantom: {
        name: 'Fantom',
        order: 4,
      },
    },
    testnets: {
      ropsten: {
        name: 'Ropsten', // ETH
        order: 5,
      },
      rinkeby: {
        name: 'Rinkeby', // ETH
        order: 6,
      },
      goerli: {
        name: 'Goerli', // ETH
        order: 7,
      },
      kovan: {
        name: 'Kovan', // ETH
        order: 8,
      },
      mumbai: {
        name: 'Mumbai', // MATIC
        order: 9,
      },
      '0x61': {
        name: 'Testnet', // BSC
        order: 10,
      },
      '0xa869': {
        name: 'Fuji', // AVAX
        order: 11,
      },
    },
  });

  // set address using address param
  useEffect(() => {
    document.title = `nft looker. ${params.walletAddress}`;
  }, [params]);

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
      .get(`/api/nfts?chain=${chain}&address=${params.walletAddress}`, {
        signal: abortController.signal,
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
      <div className="flex justify-center">
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
            <ScrollMenu
              LeftArrow={LeftArrow}
              RightArrow={RightArrow}
              onWheel={onWheel}
            >
              {Object.keys(collections['mainnets']).map((chain, idx) => (
                <ChainTab
                  chain={chain}
                  collections={collections['mainnets']}
                  index={idx}
                  key={idx}
                  ItemId={idx}
                />
              ))}
            </ScrollMenu>
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
          </TabPanels>
        </Tabs>
      </div>

      <div className="flex justify-center">
        <Tabs
          //index={chainTab}
          //onChange={(index) => setChainTab(index)}
          align="center"
          variant="solid-rounded" // variant="enclosed"
          colorScheme="gray"
          isLazy={true}
          lazyBehavior={true}
          className="overflow-x-hidden"
        >
          <ScrollMenu
            LeftArrow={LeftArrow}
            RightArrow={RightArrow}
            onWheel={onWheel}
          >
            <Tab itemId={1}>Ethereum</Tab>
            <Tab itemId={2}>Polygon</Tab>
            <Tab itemId={3}>Binance</Tab>
            <Tab itemId={4}>Avalanche</Tab>
          </ScrollMenu>

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
          </TabPanels>
        </Tabs>
      </div>
    </>
  );
}
