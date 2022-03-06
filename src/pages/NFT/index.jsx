import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

// Redux
import { useDispatch } from 'react-redux';
import {
  viewIsLoading,
  viewIsNotLoading,
} from '../../state/loading/loadingSlice';

// React Query
import axios from 'axios';
import { useQuery } from 'react-query';

// Chakra UI
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';

// ModelViewer
import ModelViewer from '@google/model-viewer'; // don't think I need this

// Components
import NFTImage from '../../components/NFTImage/NFTImage';

// UTILS
import truncateAddress from '../../utils/ellipseAddress';
import { explorer } from '../../utils/chainExplorer';

export function NFT() {
  const params = useParams(); // React Router
  const dispatch = useDispatch(); // React Redux

  // React Query
  const { isLoading, error, data } = useQuery(
    'nftMetadata',
    async () => {
      const { data } = await axios(
        `/api/nft?chain=${params.chain}&address=${params.contractAddress}&tokenId=${params.tokenId}`
      );
      return data;
    },
    { refetchOnWindowFocus: false }
  );

  useEffect(() => {
    if (data) dispatch(viewIsNotLoading());
    else dispatch(viewIsLoading());
  }, [data]);

  if (isLoading) return null;
  if (error) return 'An error has occurred: ' + error.message;

  return (
    <div className="space-y-10">
      <section className="grid grid-cols 1 md:grid-cols-2 gap-5">
        <div className="mx-auto w-full md:w-3/4">
          <NFTImage
            nft={data}
            chain={params.chain}
            image={data.metadata && data.metadata.image}
          />
        </div>
        <div>
          <h3 className="pb-2 border-b border-gray-500 text-4xl font-bold ">
            {data.metadata.name}
          </h3>

          <div className="space-y-5">
            <div>
              DESCRIPTION
              <br />
              <span className="text-2xl">
                {data.metadata.description ? (
                  <>{data.metadata.description}</>
                ) : (
                  <>None</>
                )}
              </span>
            </div>

            {data.metadata.attributes && (
              <div>
                ATTRIBUTES
                <br />
                <div className="text-2xl">
                  {data.metadata.attributes &&
                    data.metadata.attributes.map((attribute, idx) => {
                      const values = Object.values(attribute);

                      return (
                        <div
                          className="grid grid-cols-2 xl:w-2/3 2xl:w-2/5"
                          key={idx} // must use idx as there can be duplicate attribute keys and values
                        >
                          <span>{values[0]}:</span>
                          <span>{values[1]}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {data.metadata.external_url && (
              <div>
                <ExternalLinkIcon />
                <br />
                <span className="text-2xl">
                  <a
                    href={data.metadata.external_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {data.metadata.external_url}
                  </a>
                </span>
              </div>
            )}

            <div>
              OWNER
              <br />
              <span className="text-2xl">
                <a
                  href={`https://${explorer(params.chain)}/address/${
                    data.owner_of
                  }`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {truncateAddress(data.owner_of)}
                </a>
              </span>
            </div>
            <div>
              COLLECTION
              <br />
              <span className="text-2xl">
                <Link to={`/${params.chain}/collection/${data.token_address}`}>
                  <ArrowBackIcon /> {data.name}
                </Link>
              </span>
            </div>
            <div>
              CONTRACT
              <br />
              <span className="text-2xl">
                <a
                  href={`https://${explorer(params.chain)}/address/${
                    data.token_address
                  }`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {truncateAddress(data.token_address)}
                </a>
              </span>
            </div>
            <div>
              TOKEN ID
              <br />
              <span className="text-2xl break-all">{data.token_id}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
