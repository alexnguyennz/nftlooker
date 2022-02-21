import React, { useEffect, useState, Profiler } from 'react';

// React Router
import { useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { NFTCollection } from '../../components/NFTCollection/NFTCollection';
import { NFTCard } from '../../components/NFTCard/NFTCard';

// MUI
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';

import Typography from '@mui/material/Typography';

// TABS
import { styled } from '@mui/system';
import TabsUnstyled from '@mui/base/TabsUnstyled';
import TabsListUnstyled from '@mui/base/TabsListUnstyled';
import TabPanelUnstyled from '@mui/base/TabPanelUnstyled';
import { buttonUnstyledClasses } from '@mui/base/ButtonUnstyled';
import TabUnstyled, { tabUnstyledClasses } from '@mui/base/TabUnstyled';

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

// ENS resolve
const ethers = require('ethers');
const web3Provider = new ethers.providers.InfuraProvider('homestead', {
  projectId: process.env.INFURA_API_ID,
  projectSecret: process.env.INFURA_API_SECRET,
});

// Unstoppable resolve
const { default: Resolution } = require('@unstoppabledomains/resolution');
const resolution = new Resolution();

const blue = {
  50: '#F0F7FF',
  100: '#C2E0FF',
  200: '#80BFFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
  800: '#004C99',
  900: '#003A75',
};

const Tab = styled(TabUnstyled)`
  color: white;
  cursor: pointer;
  font-weight: bold;
  background-color: transparent;
  // width: 100%;
  padding: 12px 12px;
  margin: 0px 0px;
  border: none;

  display: flex;
  justify-content: center;

  &:hover {
    background-color: ${blue[400]};
  }

  &.${tabUnstyledClasses.selected} {
    background-color: ${blue[50]};
    color: ${blue[600]};
  }

  &.${buttonUnstyledClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabPanel = styled(TabPanelUnstyled)`
  width: 100%;
`;

const TabsList = styled(TabsListUnstyled)`
  // min-width: 320px;
  background-color: ${blue[500]};
  // border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: space-between;
`;

export function UserNFTs(props) {
  // States
  const [address, setAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');

  const [noNfts, setNoNfts] = useState();

  const [chainTab, setChainTab] = useState(0);

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

  const [loaded, setLoaded] = useState(false);

  // React Router
  let location = useLocation();
  let params = useParams();

  async function resolveAddress(address) {
    // reset loading states
    props.onLoading(true);
    setLoaded(false);

    // resolve domains
    if (address.startsWith('0x')) {
      setAddress(address);
    } else if (address.endsWith('.eth')) {
      // ENS
      const resolvedAddress = await web3Provider.resolveName(address);

      setAddress(resolvedAddress);
    } else {
      // Unstoppable Domains
      await resolution
        .addr(address, 'eth')
        .then((address) => {
          setAddress(address);
        })
        .catch(console.error);
    }
  }

  // set address using address param
  useEffect(() => {
    // resolve address here
    resolveAddress(params.walletAddress);
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

  useEffect(() => {}, [noNfts]);

  async function fetchNfts(chain) {
    await axios
      .get(
        `/.netlify/functions/server/api/nfts?chain=${chain}&address=${address}`
      )
      .then((response) => {
        const data = response.data;

        // count the number of NFTs
        let nftCount = 0;

        Object.keys(data).forEach((item) => {
          nftCount += data[item].length;
        });

        // set the chain tab to one that has NFTs
        if (nftCount !== 0) {
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

    return (
      <Tab
        onChange={() => setChainTab(idx)}
        title={
          !allCollections[chain].count
            ? 'No NFTs found.'
            : `${allCollections[chain].count} NFTs found.`
        }
        disabled={!allCollections[chain].count}
        value={idx}
      >
        {allCollections[chain].name}{' '}
        {allCollections[chain].count > 0 && `(${allCollections[chain].count})`}
      </Tab>
    );
  }

  return (
    <>
      {loaded && (
        <TabsUnstyled value={chainTab}>
          <TabsList className="text-xs">
            {Object.keys(allCollections).map((chain, idx) => (
              <ChainTab chain={chain} key={idx} index={idx} />
            ))}
          </TabsList>

          {Object.keys(allCollections).map((chain, idx) => (
            <TabPanel value={idx} key={chain}>
              <RenderData chain={chain} />
            </TabPanel>
          ))}
        </TabsUnstyled>
      )}
    </>
  );
}
