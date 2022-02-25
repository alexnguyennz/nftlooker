import React, { useEffect, useState, Profiler } from 'react';

// React Router
import { useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { NFTCollection } from '../../components/NFTCollection/NFTCollection';
import { NFTCard } from '../../components/NFTCard/NFTCard';

// Chakra

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { PhoneIcon } from '@chakra-ui/icons';

import {
  Ethereum,
  Polygon,
  Binance,
  Avalanche,
  Fantom,
} from '../../components/ChainIcons';

import '../../index.css';

// UTILS
import profilerCallback from '../../utils/profilerCallback';

export function UserNFTs(props) {
  // States
  const [address, setAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  const [noNfts, setNoNfts] = useState('');

  const [loaded, setLoaded] = useState(false);

  const [chainTab, setChainTab] = useState();
  const [testnetChainTab, setTestnetChainTab] = useState();

  const [testCollections, setTestCollections] = useState({
    eth: {
      name: 'Ethereum',
      loaded: false,
      data: {},
      count: 0,
      order: 0,
      testnet: false,
    },
    matic: {
      name: 'Polygon',
      loaded: false,
      data: {},
      count: 0,
      order: 1,
      testnet: false,
    },
    binance: {
      name: 'Binance',
      loaded: false,
      data: {},
      count: 0,
      order: 2,
      testnet: false,
    },
    avalanche: {
      name: 'Avalanche',
      loaded: false,
      data: {},
      count: 0,
      order: 3,
      testnet: false,
    },
    fantom: {
      name: 'Fantom',
      loaded: false,
      data: {},
      count: 0,
      order: 4,
      testnet: false,
    },
    ropsten: {
      name: 'Ropsten', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 5,
      testnet: true,
    },
    rinkeby: {
      name: 'Rinkeby', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 6,
      testnet: true,
    },
    goerli: {
      name: 'Goerli', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 7,
      testnet: true,
    },
    kovan: {
      name: 'Kovan', // ETH
      loaded: false,
      data: {},
      count: 0,
      order: 8,
      testnet: true,
    },
    mumbai: {
      name: 'Mumbai', // MATIC
      loaded: false,
      data: {},
      count: 0,
      order: 9,
      testnet: true,
    },
    '0x61': {
      name: 'Testnet', // BSC
      loaded: false,
      data: {},
      count: 0,
      order: 10,
      testnet: true,
    },

    '0xa869': {
      name: 'Fuji', // AVAX
      loaded: false,
      data: {},
      count: 0,
      order: 11,
      testnet: true,
    },
  });

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

  const fetchController = new AbortController();

  useEffect(() => {
    return () => {
      fetchController.abort();
      props.onLoading(false);
    };
  }, []);

  // set address using address param
  useEffect(() => {
    setAddress(params.walletAddress);

    //getData();
    //console.log('location', location.state);
  }, [location]);

  useEffect(() => {
    // only run when address is valid
    if (address) {
      getData();
    }
  }, [address]);

  useEffect(() => {
    // if loaded is true (all NFT data has been set in state), find out if there are any NFTs or not
    if (loaded) {
      if (props.testnets) {
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
    console.log(allCollections);
  }, [allCollections]);

  async function fetchTestnetNfts(chain) {
    await axios
      .get(`/api/nfts?chain=${chain}&address=${address}`, {
        signal: fetchController.signal,
      })
      .then((response) => {
        const data = response.data;

        // count the number of NFTs
        let nftCount = 0;

        Object.keys(data).forEach((item) => {
          nftCount += data[item].length;
        });

        // set the chain tab to one that has NFTs
        if (nftCount > 0) {
          setTestnetChainTab(testnetCollections[chain].order);
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
      });
  }

  async function fetchNfts(chain) {
    await axios
      .get(`/api/nfts?chain=${chain}&address=${address}`, {
        signal: fetchController.signal,
      })
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

        // chains.map((chain, idx) => {
        //   console.log('chains', idx);
        //   if (allCollections[Object.keys(chain)].count > 0) {
        //     setChainTab(idx);
        //   }
        // });
      });
  }

  /*
  async function getAllData() {
    // reset loading states
    props.onLoading(true);
    setTestnetsLoaded(false);

    let promises = [];

    if (props.testnets) {
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

    Promise.all(promises).then(() => {
      props.onLoading(false);
      setTestnetsLoaded(true);
    });
  }*/

  async function getData() {
    // reset loading states
    props.onLoading(true);
    setLoaded(false);

    console.log('getData');

    let promises;

    if (props.testnets) {
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

    Promise.all(promises).then(() => {
      props.onLoading(false);
      setLoaded(true);
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
        borderRadius="25px"
      >
        <div className="flex flex-col md:flex-row">
          <span className="mr-2 text-center">
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
        colorScheme="blue"
        isLazy="true"
        lazyBehavior="true"
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

        {props.testnets && loaded && !noNfts && (
          <TabList>
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

          {props.testnets &&
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

{
  /* testnetsLoaded && !noNfts && (
        <Tabs
          index={testnetChainTab}
          onChange={(index) => setTestnetChainTab(index)}
          align="center"
          variant="solid-rounded" // variant="enclosed"
          colorScheme="blue"
          isLazy="true"
          lazyBehavior="true"
        >
          <TabList>
            {Object.keys(testnetCollections).map((chain, idx) => (
              <TestnetChainTab chain={chain} key={idx} index={idx} />
            ))}
          </TabList>

          <TabPanels>
            {Object.keys(testnetCollections).map((chain, idx) => (
              <TabPanel value={idx} key={chain}>
                <RenderTestnetData chain={chain} />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}
      {noNfts && (
        <p className="mt-10 font-bold text-2xl text-center ">
          No NFTs found :(
          <img
            src="/img/sad.png"
            alt="sad Moogle art"
            className="mx-auto mt-10"
            width="450"
          />
        </p>
          ) */
}
