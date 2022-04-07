import React, { useEffect, useState } from 'react';

// Router
import { useLocation, useParams } from 'react-router-dom';

// State
import { useSelector, useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
} from '../../state/loading/loadingSlice';
import { changeChainTab, chainTabState } from '../../state/tab/tabSlice';

// Data
import { useQueries } from 'react-query';
import axios from 'axios';
import chains from '../../data'; // placeholder

// Components
import NoNFTs from '../../components/NoNFTs/NoNFTs';
import ChainTab from '../../components/ChainTab/ChainTab';
import ChainData from '../../components/ChainTab/ChainData/ChainData';

// Chakra UI
import {
  useToast,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { EmailIcon } from '@chakra-ui/icons';

import { FaTwitter, FaFacebook } from 'react-icons/fa';

import {
  EmailShareButton,
  FacebookShareButton,
  TwitterShareButton,
} from 'react-share';

import toast from '../../components/Toast/Toast';

export default function UserNFTs() {
  // Router
  const params = useParams();
  const location = useLocation();

  // State
  const dispatch = useDispatch();
  const chainTab = useSelector(chainTabState);
  let chainTabSet = false;

  const [noNfts, setNoNfts] = useState(false);

  const toastInstance = useToast();

  const [, setToggle] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setToggle((toggle) => !toggle);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.title = `NFT Looker. ${params.walletAddress}`;

    return () => {
      dispatch(viewIsNotLoading());
      document.title = `NFT Looker. A simple NFT viewer.`;
    };
  }, []);

  const queries = useQueries(
    Object.keys(chains).map((chain) => {
      return {
        queryKey: [location, params.walletAddress, chain], // location
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

      // check for any NFTs

      interface IChain {
        count: number;
        loaded: boolean;
        name: string;
        order: number;
        // data
      }

      setNoNfts(
        Object.values(queries).every((collection) => {
          //console.log('Test', collection.data);
          // collection.data = {eth: {}}
          const chain: IChain = Object.values(collection.data)[0];
          return chain.count === 0;
        })
      );
    }
  }, [queries]);

  async function fetchNfts(chain: string, signal: AbortSignal) {
    console.log('signal', signal);
    // reset UI
    dispatch(changeChainTab(-1));
    setNoNfts(false);

    // Go test
    /* const { data } = await axios(
      `http://localhost:9999/nfts/chain/eth/address/0xcd2E72aEBe2A203b84f46DEEC948E6465dB51c75`
    );

    console.log('Go Response:', Object.values(data)[0][0]); */

    //console.log('Go', JSON.parse(Object.values(data)[0][0].Metadata));

    return await axios(
      `/api/nfts?chain=${chain}&address=${params.walletAddress}`,
      {
        signal,
      }
    )
      .then(({ data }) => {
        //console.log('Original Response', data);
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
            abbr: chains[chain]['abbr'],
            data: {},
            loaded: true,
            count: 0,
          },
        };
      });
  }

  function ShareMenu() {
    return (
      <Popover>
        <PopoverTrigger>
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Share</PopoverHeader>
          <PopoverBody className="flex items-center mx-auto space-x-5">
            <EmailShareButton
              url=""
              subject="View NFTs"
              body={`View NFTs at https://nftlooker.app${location.pathname}`}
            >
              <EmailIcon />
            </EmailShareButton>
            <TwitterShareButton
              url={`nftlooker.app${location.pathname}`}
              title={`View NFTs at`}
            >
              <FaTwitter />
            </TwitterShareButton>
            <FacebookShareButton
              url={`nftlooker.app${location.pathname}`}
              quote={`View NFTs at`}
            >
              <FaFacebook />
            </FacebookShareButton>
          </PopoverBody>
        </PopoverContent>
      </Popover>
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
        isLazy={false}
      >
        <TabList>
          <div className="flex items-center">
            {queries.map((query, idx) => (
              <ChainTab chain={query.data} idx={idx} key={idx} />
            ))}
          </div>
        </TabList>

        <TabPanels>
          {queries.map((query) => (
            <TabPanel key={Object.keys(query.data)[0]} paddingX="0">
              <ChainData chain={query.data} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {noNfts && <NoNFTs noNfts={noNfts} />}
    </>
  );
}
