import { useState } from 'react';

import { Link } from 'react-router-dom';

import axios from 'axios';

import { Button } from '@chakra-ui/react';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';

const mime = require('mime-types');

const contentType = require('content-type');

async function getContentType(image) {
  const response = await axios.get(image);

  const type = contentType.parse(response);

  console.log(type.type);

  return type.type;
}

function NFTImage(props) {
  const collection = props.collection;
  const chain = props.chain;

  const nft = props.nft;
  const image = nft.metadata.image;
  const mimeType = mime.lookup(image);

  let type;

  //getContentType(image).then((response) => (type = response));

  console.log('mime', mimeType);

  switch (mimeType) {
    case 'image/gif':
      return (
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    case 'video/mp4':
      return (
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    default:
      return (
        <Link
          to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
        >
          <img
            src={image}
            /*onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = '/img/404.webp';
            }}*/
            className="mx-auto w-full"
          />
        </Link>
      );
  }
}

export function NFTCard(props) {
  //const metadata = props.nft.external_data;
  const nft = props.nft;
  const collection = props.collection;
  const chain = props.chain;

  const colorModeBg = useColorModeValue('bg-white', 'bg-gray-800');

  //console.log('received nft', nft);
  //console.log('received collection', collection);

  return (
    <>
      <div className="flex flex-col max-w-sm">
        <div
          className={`mt-auto overflow-hidden rounded-lg shadow-md  transition-all hover:-translate-y-2 ${colorModeBg}`}
        >
          {nft.metadata && (
            <NFTImage collection={collection} nft={nft} chain={chain} />
          )}

          <div className="p-3 mt-auto space-y-2">
            <h3 className="text-center font-semibold">
              <Link
                to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
              >
                {nft.metadata && nft.metadata.name}
              </Link>
            </h3>
            <div className="float-right pb-3">
              <Button size="xs">
                <Link
                  to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
                >
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
