import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
  loadingState,
} from '../../state/loading/loadingSlice';

// React Query
import axios from 'axios';
import { useQueries, useInfiniteQuery } from 'react-query';

// Chakra UI
import { Button, Alert, AlertIcon } from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';

// Components
import NFTCard from '../../components/NFTCard/NFTCard';
import NFTImage from '../../components/NFTImage/NFTImage';

// UTILS
import truncateAddress from '../../utils/ellipseAddress';
import { explorer, chainName } from '../../utils/chainExplorer';

export function Collection() {
  const params = useParams(); // React Router
  const dispatch = useDispatch(); // React Redux
  const loading = useSelector(loadingState);

  console.log('params', params);

  // React Query
  const queries = useQueries([
    {
      queryKey: [params.chain, params.contractAddress, 'metadata'],
      queryFn: async () => {
        const { data } = await axios(
          `/api/collection/metadata?chain=${params.chain}&address=${params.contractAddress}`
        );
        return data;
      },
    },
    {
      queryKey: [params.chain, params.contractAddress, 'nfts'],
      queryFn: async () => {
        const { data } = await axios(
          `/api/collection/nfts?chain=${params.chain}&address=${params.contractAddress}&offset=0&limit=1`
        );
        return data;
      },
    },
  ]);

  //console.log('results', results[2].data[0]);
  const loaded = queries.every((query) => query.isSuccess);

  console.log('queries', queries);

  useEffect(() => {
    if (queries.some((query) => query.isFetching)) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());
    }
  }, [queries]);

  return (
    <>
      <div className="space-y-10">
        <section className="grid grid-cols 1 md:grid-cols-2 gap-5">
          <div className="mx-auto w-full md:w-3/4">
            {!queries[1].isFetching ? (
              <CollectionThumbnail result={queries[1].data[0]} />
            ) : (
              <div className="flex items-center justify-center">
                <img src="/img/loading.svg" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            {!queries[0].isFetching ? (
              <CollectionMetadata result={queries[0]} />
            ) : (
              <div className="flex items-center justify-center">
                <img src="/img/loading.svg" />
              </div>
            )}
          </div>
        </section>
        <CollectionNfts />
      </div>
    </>
  );
}

async function fetchNfts({ pageParam = 0 }) {
  const params = useParams();

  const { data } = await axios(
    `/api/collection/nfts?chain=${params.chain}&address=${params.contractAddress}&offset=${pageParam}&limit=5`
  );
  return { data, nextPage: pageParam + 1, totalOffset: 100 };
}

export function CollectionThumbnail(props) {
  const params = useParams(); // React Router

  const data = props.result;

  /* if (isLoading) return null;
  if (error) return 'An error has occurred: ' + error.message; */

  // hacky solution
  const image = data.metadata.image
    .replace('h-250', 'h-1000')
    .replace('w-250', 'h-1000');

  return (
    <NFTImage nft={data} chain={params.chain} image={data.metadata && image} />
  );
}

export function CollectionMetadata(props) {
  const params = useParams(); // React Router

  const data = props.result.data;

  /* if (isLoading) return null;
  if (error) return 'An error has occurred: ' + error.message; */

  return (
    <>
      <h3 className="pb-2 border-b border-gray-500 text-4xl font-bold ">
        {data.name}
      </h3>

      <div className="space-y-5">
        <p>
          CHAIN
          <br />
          <span className="text-2xl">{chainName(params.chain)}</span>
        </p>

        <p>
          CONTRACT
          <br />
          <span className="text-2xl">
            <a
              href={`https://${explorer(params.chain)}/address/${
                data.token_address
              }`}
              target="_blank"
              rel="noreferrer noopener nofollow"
            >
              {truncateAddress(data.token_address)}
              {` `}
              <ExternalLinkIcon />
            </a>
          </span>
        </p>

        <p>
          SYMBOL / TICKER
          <br />
          <span className="text-2xl">{data.symbol}</span>
        </p>
      </div>
    </>
  );
}

export function CollectionNfts() {
  const params = useParams(); // React Router

  const fetchNfts = async ({ pageParam = 0 }) => {
    const { data } = await axios(
      `/api/collection/nfts?chain=${params.chain}&address=${params.contractAddress}&limit=5&offset=` +
        pageParam
    );

    let offset = pageParam + 5; // manually increase each "page"

    return { data, offset };
  };

  // infinite queries
  const {
    data,
    error,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    // } = useInfiniteQuery('nftMetadata', fetchNfts, {
  } = useInfiniteQuery([params.chain, params.contractAddress], fetchNfts, {
    getNextPageParam: (lastPage) => {
      if (lastPage.offset <= 500) return lastPage.offset; // only allow up to 100 pages / 500 offsets
    },
  });

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <img src="/img/loading.svg" />
        </div>
      ) : isError ? (
        <Alert status="error" justifyContent="center">
          <AlertIcon />
          Error fetching NFTs for this collection.
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {data.pages.map((page) => (
              <React.Fragment key={page.offset}>
                {page.data.map((nft) => (
                  <NFTCard
                    key={nft.token_id}
                    collection={data}
                    nft={nft}
                    chain={params.chain}
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
      )}
    </div>
  );
}
