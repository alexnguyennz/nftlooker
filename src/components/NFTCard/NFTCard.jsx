import { Link } from 'react-router-dom';

import axios from 'axios';

import { Button } from '@chakra-ui/react';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import { Spinner } from '@chakra-ui/react';

import { Tooltip } from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';

import ModelViewer from '@google/model-viewer';

// Components
//import NFTImage from '../../components/NFTImage/NFTImage';

const mime = require('mime-types');

const contentType = require('content-type');

async function getContentType(image) {
  const response = await axios.get(image);

  const type = contentType.parse(response);

  console.log(type.type);

  return type.type;
}

function LoadingSpinner() {
  return (
    <div className="p-10">
      <Spinner w={24} h={24} thickness="8px" speed="0.9s" color="blue.500" />
    </div>
  );
}

function NFTImage(props) {
  const chain = props.chain;

  const nft = props.nft;
  const image = nft.metadata.image;
  const mimeType = mime.lookup(image);
  console.log('mimeType', mimeType);

  // getContentType(nft.metadata.original_image);
  console.log('content type:', nft.metadata.content_type);

  console.log('NFTImage', nft);

  //switch (mimeType) {
  switch (nft.metadata.content_type) {
    /* case 'image/gif':
      return (
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ); */
    case 'video/mp4':
      return (
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    case 'video/webm':
      return (
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      );
    case 'model/gltf-binary':
      return (
        <model-viewer
          bounds="tight"
          src={image}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          environment-image="neutral"
          //poster="poster.webp"
          shadow-intensity="1"
          autoplay
          width="100px"
          height="100px"
        ></model-viewer>
      );
    case 'audio/wave':
    case 'audio/wav':
    case 'audio/mpeg':
    case 'audio/ogg':
    case 'audio/webm':
      return (
        <audio
          style={{ width: '100%' }}
          src={image}
          controls
          preload="length"
        ></audio>
      );
    default:
      return (
        <Link
          to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
        >
          <Image
            src={image}
            // onError={({ currentTarget }) => {
            //   currentTarget.onerror = null; // prevents looping
            //   currentTarget.src = '/img/no-image.png';
            // }}
            //fallback={<LoadingSpinner />}
            className="mx-auto w-full"
          />
        </Link>
      );
  }
}

export default function NFTCard(props) {
  //const metadata = props.nft.external_data;
  const nft = props.nft;
  //const collection = props.collection;
  const chain = props.chain;

  const colorModeBg = useColorModeValue('bg-white', 'bg-gray-800');
  const colorModeCard = useColorModeValue(
    'bg-gray-50 border-gray-100',
    'bg-gray-700 border-gray-800'
  );

  //console.log('received nft', nft);
  //console.log('received collection', collection);

  return (
    <>
      <div className="flex flex-col max-w-sm ">
        <div
          // className={`mt-auto overflow-hidden rounded-lg shadow-md transition-all hover:-translate-y-2 ${colorModeBg}`}
          className={` mt-auto rounded-b-lg shadow-md transition-all hover:-translate-y-2 ${colorModeBg}`}
        >
          {nft.metadata && (
            // <NFTImage collection={collection} nft={nft} chain={chain} />
            <NFTImage nft={nft} chain={chain} />
          )}

          {/* bg-gray-50 border-t border-gray-100 */}
          <div
            className={`p-3 mt-auto space-y-2 border-t rounded-b-lg ${colorModeCard}`}
          >
            <h3 className="text-center font-semibold">
              <Link
                to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
              >
                {nft.metadata && nft.metadata.name}
              </Link>
            </h3>
            <div className="flex justify-between items-center">
              <Button size="xs">
                <Link
                  to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
                >
                  View
                </Link>
              </Button>
              {nft.metadata.original_image && (
                <Tooltip label="Open original link" openDelay={750} hasArrow>
                  <a
                    href={nft.metadata.original_image}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="z-0"
                  >
                    <ExternalLinkIcon boxSize={4} />
                  </a>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
