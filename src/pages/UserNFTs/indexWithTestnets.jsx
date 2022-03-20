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

  const [noNfts, setNoNfts] = useState('');

  const [chainTab, setChainTab] = useState(null);
  let chainTabSet = false;

  const [collections, setCollections] = useState(initialCollections);

  useEffect(() => {
    return () => {
      dispatch(viewIsNotLoading());
    };
  }, []);

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
            queryKey: [params.walletAddress, chain], // location
            queryFn: ({ signal }) => fetchNfts(chain, true, signal),
            placeholderData: {
              [chain]: initialCollections['mainnets'][chain],
            },
          };
        })
      )
    );
  } else {
    const mainnets = Object.keys(collections.mainnets).map((chain) => {
      return {
        queryKey: [params.walletAddress, chain],
        queryFn: ({ signal }) => fetchNfts(chain, true, signal),
      };
    });

    const testnets = Object.keys(collections.testnets).map((chain) => {
      return {
        queryKey: [params.walletAddress, chain],
        queryFn: ({ signal }) => fetchNfts(chain, false, signal),
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

    console.log('chain queries', chainQueries);
  }, [chainQueries]);

  useEffect(() => {
    console.log('collections', collections);
  }, [collections]);

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

  async function fetchNfts(chain, isMainnet, signal) {
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

      return {
        [chain]: data,
      };

      // return data;
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
            {!collections[chain].loaded && loading && (
              <Spinner size="sm" label="loading" />
            )}
          </div>
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
          {
            // !loading &&
            !noNfts &&
              Object.keys(collections['mainnets']).map((chain, idx) => (
                <TabPanel value={idx} key={chain}>
                  <RenderData
                    chain={chain}
                    collections={collections['mainnets']}
                  />
                </TabPanel>
              ))
          }

          {chainQueries[0].map((query) => {
            //console.log('query', query.data);
            /* if (query.data) {
              const chain = Object.keys(query.data);

              const values = Object.values(query.data[chain]);

              if (values[0]) {
                return values[0].map((item) => <>{item.token_address}</>);
              }
            } */
            //console.log('data', test);
            //console.log(Object.keys(query.data)[0]);
            //const chainName = Object.keys(query.data)[0];
            /* if (query.data) {
              Object.values(query.data).map((chain, idx) => (
                //console.log('inner', data);
                <TabPanel value={idx} key={chainName}>
                <RenderData chain={chainName} collections />
                </TabPanel>
                
              ));
            } */
          })}

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
  );
}
