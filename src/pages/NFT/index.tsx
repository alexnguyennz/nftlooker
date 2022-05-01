import { useEffect, useState } from 'react';

import { Link as RouterLink, useParams } from 'react-router-dom';

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
import { useColorModeValue, Button, Tooltip, Link, Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer, } from '@chakra-ui/react';
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';

// ModelViewer
import ModelViewer from '@google/model-viewer'; // don't think I need this

// Components
import NFTImage from '../../components/NFTImage/NFTImage';

// UTILS
import truncateAddress from '../../utils/ellipseAddress';
import { explorer } from '../../utils/chainExplorer';

import ReactMarkdown from 'react-markdown';
import { stripHtml } from "string-strip-html";


export default function NFT() {
  const params = useParams(); // React Router
  const dispatch = useDispatch(); // React Redux

  const colorModeBg = useColorModeValue('bg-white', 'bg-gray-800');
  const colorModeCard = useColorModeValue(
    'bg-gray-50 border-gray-100',
    'bg-gray-700 border-gray-800'
  );

  // React Query
  const { isLoading, error, data, isFetching, isStale } = useQuery(
    [params.chain, params.contractAddress, params.tokenId, 'nftMetadata'],
    async () => {
      const { data } = await axios(
        `/api/nft/chain/${params.chain}/address/${params.contractAddress}/id/${params.tokenId}`
      );
      return data;
    }
  );

  useEffect(() => {
    if (data) {
      dispatch(viewIsNotLoading());
      // console.log('data', data.metadata.attributes);
    } else dispatch(viewIsLoading());
  }, [data]);

  if (isLoading) return null;

  return (
    <>
      <section className={`grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-lg shadow-md ${colorModeBg}`}>
        <div className="p-10 flex content-center">
          <NFTImage nft={data} />
        </div>
        <div>
          <div className="float-right">
            {data.metadata.original_image ? (
              <Tooltip label="Open original link" openDelay={750} hasArrow>
                <Link href={data.metadata.original_image} isExternal>
                  <ExternalLinkIcon boxSize={4} />
                </Link>
              </Tooltip>
            ) : data.token_uri ? (
              <Tooltip label="Open original link" openDelay={750} hasArrow>
                <Link href={data.token_uri} isExternal>
                  <ExternalLinkIcon boxSize={4} />
                </Link>
              </Tooltip> )
            : <></> }
          </div>
          <h3 className="pb-5 text-4xl font-bold">{data.metadata.name}</h3>

          <div className="space-y-5">
            <div>
              <p>DESCRIPTION</p>
              <span className="text-xl">
                {data.metadata.description && <ReactMarkdown>{stripHtml(data.metadata.description).result}</ReactMarkdown>}
              </span>
            </div>

            {data.metadata.attributes && (
              <div>
                <p>ATTRIBUTES</p>
                <div className="text-xl">
                <TableContainer whiteSpace="normal">
                  <Table variant="">
                    {data.metadata.attributes.map((attribute, idx) => {
                      const values = Object.values(attribute);

                      return (
                        <Tr>
                          <Td>{values[0]}</Td>
                          <Td>{values[1]}</Td>
                        </Tr>
                      );
                    })}
                    </Table>
                  </TableContainer>
                </div>
              </div>
            )}

            { data.metadata.external_url && (
              <div>
                <p>External URL</p>
                <span className="text-xl">
                  <Link href={data.metadata.external_url} isExternal>
                    {data.metadata.external_url} <ExternalLinkIcon w="4" />
                  </Link>
                </span>
              </div>
            ) }

            <div>
              <p>TOKEN ID</p>
              <span className="text-xl">
                <Link href={`https://${explorer(params.chain)}/token/${data.token_address}?a=${data.token_id}`} isExternal>
                  <span className="flex items-center space-x-3">
                    <span>{truncateAddress(data.token_id)}</span>
                    <ExternalLinkIcon w="4" />
                  </span>
                </Link>
              </span>
            </div>

            <div>
              <p>COLLECTION</p>
              <span className="text-2xl space-x-3">
                <Button>
                <RouterLink
                  to={`/${params.chain}/collection/${data.token_address}`}
                >
                  {data.name}
                </RouterLink>
                </Button>
                <Link href={`https://${explorer(params.chain)}/address/${data.token_address}`} isExternal>
                  <ExternalLinkIcon w="4" />
                </Link>
              </span>
            </div>

            <div>
              <p>OWNER</p>
              <span className="text-2xl space-x-3">
                <Button><RouterLink to={`/${data.owner_of}`}>View NFTs</RouterLink></Button>
                <Link href={`https://${explorer(params.chain)}/address/${data.owner_of}`} isExternal>
                  <ExternalLinkIcon w="4" />
                </Link>
              </span>
            </div>
          </div>
        </div>
        
      </section>
    </>
  );
}


/*
return (
    <>
      <div className="space-y-10">
        <section className="grid grid-cols 1 md:grid-cols-2 gap-5">
          <div className="mx-auto w-full md:w-3/4">
            <NFTImage nft={data} />
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
                    {data.metadata.attributes.map((attribute, idx) => {
                      const values = Object.values(attribute);

                      return (
                        <div
                          className="grid grid-cols-2 "
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
                  </a>{' '}
                  -{' '}
                  <a
                    href={`/${data.owner_of}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    View NFTs
                  </a>
                </span>
              </div>
              <div>
                COLLECTION
                <br />
                <span className="text-2xl">
                  <Link
                    to={`/${params.chain}/collection/${data.token_address}`}
                  >
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
    </>
  );
*/