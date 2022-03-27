import React, { useEffect, useState } from 'react';

// State
import { useSelector, useDispatch } from 'react-redux';
import { changeChainTab, chainTabState } from '../../../state/tab/tabSlice';
import {
  searchLimitState,
  searchFilterState,
} from '../../../state/search/searchSlice';

// Data
import { useInfiniteQuery } from 'react-query';
import axios from 'axios';
import chains from '../../../data'; // placeholder data

// Chakra UI
import { Button, Alert, AlertIcon } from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';

// Components
import NFTCollection from '../../NFTCollection/NFTCollection';
import ChainData from './ChainData';

function SearchChainData(props) {
  // State
  const dispatch = useDispatch();

  const searchLimit = useSelector(searchLimitState);
  const searchFilter = useSelector(searchFilterState);

  const chain = props.chain;

  //console.log('props test', props.chains[chain].loaded);

  const fetchNfts = async ({ pageParam = 0 }) => {
    const { data } = await axios(
      `/api/search?chain=${chain}&q=${props.q}&filter=${searchFilter}&limit=${searchLimit}&offset=` +
        pageParam
    );

    const nftCount = Object.values(data).flat().length;

    // set the chain tab to one that has NFTs and only set it once i.e. the first loaded tab
    // buggy this is needed for some reason
    if (nftCount > 0 && !props.chainTabSet) {
      dispatch(changeChainTab(chains[chain].order));
      props.onChainTabSet(true);
    }

    // React Query
    console.log('searchLimit', searchLimit);
    let offset = pageParam + searchLimit; // manually increase each "page" by the limit

    return {
      [chain]: {
        name: chains[chain]['name'],
        abbr: chain,
        order: chains[chain]['order'],
        data,
        loaded: true,
        count: nftCount,
      },
      offset,
    };
  };

  // infinite queries
  const {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    // } = useInfiniteQuery('nftMetadata', fetchNfts, {
  } = useInfiniteQuery(['search', props.q, props.chain], fetchNfts, {
    getNextPageParam: (lastPage) => {
      if (lastPage.offset <= 500) return lastPage.offset; // only allow up to 100 pages / 500 offsets
    },
  });

  useEffect(() => {
    // console.log('data', data);
    if (data) {
      //props.onChains({...props.chains, props. })

      let copy = props.chains;

      // work on flattening to get updated page count
      copy[chain].count = data.pages[0][chain].count;

      copy[chain].loaded = true;

      props.onChains(copy);

      //console.log('data', data);
      console.log('updated states for', chain);
    }
  }, [data]);

  if (!isSuccess) {
    return null;
  }

  return (
    <>
      {/* <div className="grid gap-5">
        {Object.keys(data.pages[0][chain].data).map((collection) => (
          <NFTCollection
            key={collection}
            collection={data.pages[0][chain].data[collection]}
            chain={chain}
          />
        ))}
      </div> */}

      <div className="grid gap-5">
        {data.pages.map((page) => (
          <React.Fragment key={page.offset}>
            {Object.keys(page[chain].data).map((collection) => (
              <NFTCollection
                key={collection}
                collection={page[chain].data[collection]}
                chain={chain}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="text-center mt-5">
        {hasNextPage ? (
          <Button
            type="submit"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            isLoading={isFetchingNextPage}
            loadingText="Loading"
            spinnerPlacement="end"
            colorScheme="blue"
            rightIcon={<ChevronDownIcon />}
          >
            More
          </Button>
        ) : (
          <Alert status="error">
            <AlertIcon />
            Limit reached.
          </Alert>
        )}
      </div>
    </>
  );
}

export default React.memo(SearchChainData);
