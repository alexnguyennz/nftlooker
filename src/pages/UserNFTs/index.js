import React, { useEffect, useState, Profiler } from 'react';

// React Router
import { useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { NFTCollection } from '../../components/NFTCollection/NFTCollection';
import { NFTCard } from '../../components/NFTCard/NFTCard';

// Chakra

import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

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

  const [chainTab, setChainTab] = useState(-1);

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
      name: 'Ropsten (ETH)',
      loaded: false,
      data: {},
      count: 0,
      order: 0,
    },
    rinkeby: {
      name: 'Rinkeby (ETH)',
      loaded: false,
      data: {},
      count: 0,
      order: 1,
    },
    goerli: {
      name: 'Goerli (ETH)',
      loaded: false,
      data: {},
      count: 0,
      order: 2,
    },
    kovan: {
      name: 'Kovan (ETH)',
      loaded: false,
      data: {},
      count: 0,
      order: 3,
    },
    '0x61': {
      name: 'Testnet (BSC)',
      loaded: false,
      data: {},
      count: 0,
      order: 4,
    },
    mumbai: {
      name: 'Mumbai (MATIC)',
      loaded: false,
      data: {},
      count: 0,
      order: 5,
    },
    '0xa869': {
      name: 'Testnet (AVAX)',
      loaded: false,
      data: {},
      count: 0,
      order: 6,
    },
  });

  const [loaded, setLoaded] = useState(false);

  // React Router
  let location = useLocation();
  let params = useParams();

  // set address using address param
  useEffect(() => {
    // resolve address here
    setAddress(params.walletAddress);
  }, [location]);

  useEffect(() => {
    // only run when address is valid
    if (address) {
      getData();
    }
  }, [address]);

  useEffect(() => {
    console.log('all collections', allCollections);
  }, [allCollections]);

  useEffect(() => {
    // if loaded is true (all NFT data has been set in state), find out if there are any NFTs or not
    if (loaded) {
      setNoNfts(
        Object.values(allCollections).every(
          (collection) => collection.count == 0
        )
      );

      // set chain tab to nothing
      //setChainTab(-1);
    }
  }, [loaded]);

  useEffect(() => {}, [noNfts]);

  async function fetchNfts(chain) {
    await axios
      .get(`/api/nfts?chain=${chain}&address=${address}`)
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

  async function getData() {
    // reset loading states
    props.onLoading(true);
    setLoaded(false);

    const promises = [
      fetchNfts('eth'),
      fetchNfts('matic'),
      fetchNfts('binance'),
      fetchNfts('avalanche'),
      fetchNfts('fantom'),
    ];

    Promise.all(promises).then(() => {
      props.onLoading(false);
      setLoaded(true);
    });
  }

  const RenderData = React.memo(function RenderData(props) {
    const chain = props.chain;

    return (
      <Profiler id={`profiler-${chain}`} onRender={profilerCallback}>
        {allCollections[chain].loaded &&
          Object.keys(allCollections[chain].data).length !== 0 && (
            <div className="grid gap-5">
              {Object.keys(allCollections[chain].data).map((collection) => (
                <NFTCollection
                  key={collection}
                  collection={allCollections[chain].data[collection]}
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
      }
    }

    // bool state if count is 0 or not (no NFTs)
    const disabled = !allCollections[chain].count;

    return (
      <Tab
        onChange={() => setChainTab(idx)}
        title={
          !allCollections[chain].count
            ? 'No NFTs found.'
            : `${allCollections[chain].count} NFTs found.`
        }
        isDisabled={disabled}
        value={idx}
        className={disabled && `css-1ltezim`}
      >
        <span className="pr-1">
          <ChainIcon />
        </span>
        {` `}
        {allCollections[chain].name}{' '}
        {allCollections[chain].count > 0 && `(${allCollections[chain].count})`}
      </Tab>
    );
  }

  return (
    <>
      {/* "whiteAlpha" | "blackAlpha" | "gray" 
      | "red" | "orange" | "yellow" | "green" | 
      "teal" | "blue" | "cyan" | "purple" | "pink" | 
      "linkedin" | "facebook" | "messenger" 
      | "whatsapp" | "twitter" | "telegram"*/}
      {/* variant 
      
"line" | "enclosed" | "enclosed-colored" | "soft-rounded" | "solid-rounded" | "unstyled"
      
      */}
      {loaded && !noNfts && (
        <Tabs
          index={chainTab}
          onChange={(index) => setChainTab(index)}
          align="center"
          variant="solid-rounded" // variant="enclosed"
          colorScheme="blue"
          isLazy
          lazyBehavior
        >
          <TabList>
            {Object.keys(allCollections).map((chain, idx) => (
              <ChainTab chain={chain} key={idx} index={idx} />
            ))}
          </TabList>

          <TabPanels>
            {Object.keys(allCollections).map((chain, idx) => (
              <TabPanel value={idx} key={chain}>
                <RenderData chain={chain} />
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
      )}
    </>
  );
}
