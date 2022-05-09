import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

// State
import { useDispatch, useSelector } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
} from '../../state/loading/loadingSlice';
import { settingsState } from '../../state/settings/settingsSlice';

// React Query
import axios from 'axios';
import { useQuery, useInfiniteQuery } from 'react-query';

// Chakra UI
import {
  useColorModeValue,
  Link,
  Button,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

// Components
import NFTCard from '../../components/NFTCard/NFTCard';
import NFTImage from '../../components/NFTImage/NFTImage';

// UTILS
import truncateAddress from '../../utils/ellipseAddress';
import { explorer, chainName } from '../../utils/chainExplorer';

import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

export default function Collection() {
  const params = useParams(); // React Router
  const dispatch = useDispatch(); // React Redux

  // React Query
  const metadata = useQuery(
    [params.chain, params.contractAddress, 'metadata'],
    async () => {
      const { data } = await axios(
        `/api/collection/metadata/chain/${params.chain}/address/${params.contractAddress}`
      );
      return data;
    }
  );

  const thumbnail = useQuery(
    [params.chain, params.contractAddress, 'nfts'],
    async () => {
      const { data } = await axios(
        `/api/collection/nfts/chain/${params.chain}/address/${params.contractAddress}/limit/1/`
      );
      return data;
    }
  );

  useEffect(() => {
    if (metadata.isFetching && thumbnail.isFetching) {
      dispatch(viewIsLoading());
    } else {
      dispatch(viewIsNotLoading());
    }
  }, [metadata.isFetching, thumbnail.isFetching]);

  const colorModeBg = useColorModeValue('bg-white', 'bg-gray-800');

  return (
    <div className="space-y-10">
      <section
        className={`grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-lg shadow-md ${colorModeBg}`}
      >
        <div className="p-10">
          {!thumbnail.isFetching ? (
            <CollectionThumbnail result={thumbnail.data.data[0]} />
          ) : (
            <LoadingSpinner />
          )}
        </div>
        <div className="space-y-2">
          {!metadata.isFetching ? (
            <CollectionMetadata result={metadata} />
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </section>
      {<CollectionNfts />}
    </div>
  );
}

export function CollectionThumbnail(props) {
  try {
    const metadata = JSON.parse(props.result.metadata);

    const data = {
      ...props.result,
      metadata,
    };

    return <NFTImage nft={data} />;
  } catch {
    return <NFTImage nft={props.result} />;
  }
}

export function CollectionMetadata(props) {
  const params = useParams(); // React Router

  const data = props.result.data;

  /* if (isLoading) return null;
  if (error) return 'An error has occurred: ' + error.message; */

  return (
    <>
      <h3 className="pb-4 text-4xl font-bold">{data.name}</h3>

      <div className="space-y-5">
        <div>
          <p>CHAIN</p>
          <span className="text-xl">{chainName(params.chain)}</span>
        </div>

        <div>
          <p>CONTRACT</p>
          <span className="text-xl">
            <Link
              href={`https://${explorer(params.chain)}/address/${
                data.token_address
              }`}
              isExternal
            >
              <span className="flex items-center space-x-3">
                <span>{truncateAddress(data.token_address)}</span>
                <ExternalLinkIcon w="4" />
              </span>
            </Link>
          </span>
        </div>

        <div>
          <p>SYMBOL / TICKER</p>
          <span className="text-xl">{data.symbol}</span>
        </div>
      </div>
    </>
  );
}

export function CollectionNfts() {
  const settings = useSelector(settingsState);

  const params = useParams(); // React Router

  const fetchNfts = async ({ pageParam = '' }) => {
    const { data } = await axios(
      `/api/collection/nfts/chain/${params.chain}/address/${params.contractAddress}/limit/${settings.limit}/` +
        pageParam
    );

    return data;
  };

  const [nfts, setNfts] = useState([]);

  // infinite queries
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    isSuccess,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery([params.chain, params.contractAddress], fetchNfts, {
    getNextPageParam: (lastPage) => lastPage.cursor,
  });

  useEffect(() => {
    //console.log('data', data);
    if (data) {
      const page = data.pages.length - 1;

      //const nfts: any = Object.values(data.pages[page].data)[0]
      //const parsedNfts = nfts.map((nft) => {

      const parsedNfts = data.pages[page].data.map((nft) => {
        const metadata = JSON.parse(nft.metadata);

        return {
          ...nft,
          metadata,
        };
      });

      //data.pages[page].data = parsedNfts;

      setNfts(parsedNfts);
    }
  }, [data]);

  useEffect(() => {
    // console.log('parsed', nfts);
  }, [nfts]);

  if (!isSuccess) return null;

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
              <React.Fragment key={page.cursor}>
                {page.data.map((nft, idx) => (
                  <NFTCard
                    key={nft.token_address + nft.token_id + idx}
                    nft={nft}
                    chain={params.chain}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          <div className="text-center mt-5">
            {hasNextPage && (
              <Button
                type="submit"
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                isLoading={isFetchingNextPage}
                loadingText="Loading"
                spinnerPlacement="end"
                colorScheme="blue"
                lineHeight="1"
              >
                Load More +{settings.limit}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
