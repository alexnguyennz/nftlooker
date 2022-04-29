import { useEffect, useState } from 'react';

// Redux
import { useSelector } from 'react-redux';
import { settingsState } from '../../state/settings/settingsSlice';

import { Link } from 'react-router-dom';

import { Button, tokenToCSSVar } from '@chakra-ui/react';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';

import { Tooltip } from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';

import ModelViewer from '@google/model-viewer';

// Image Transformation
import generateNftUrl from '../../utils/generateNftUrl';

import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewer &
        React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface ModelViewer {
  bounds: string;
  src: string;
  ar: boolean;
  'ar-modes': string;
  'camera-controls': boolean;
  'environment-image': string;
  'shadow-intensity': string;
  autoplay: boolean;
  width: string;
  height: string;
}

function NFTImage(props) {
  const settings = useSelector(settingsState);

  const { chain, nft } = props;

  const [image, setImage] = useState('');
  const [nftContentType, setNftContentType] = useState('');

  useEffect(() => {
    async function generateUrl() {
      try {
        /* const { image, contentType } = await generateNftUrl(
          nft.metadata.image,
          '250'
        ); */

        const { image, contentType } = generateNftUrl(nft.metadata.image, nft.metadata.content_type, nft.metadata.content_length, '250', settings.largenfts);

        setImage(image);
        setNftContentType(contentType);
      } catch (err) {
        console.log(err);
      }
    }

    generateUrl();
  }, []);

  //if (!image) return <LoadingSpinner />;

  switch (nftContentType) {
    // case 'image/gif':
    case 'video/mp4':
    case 'video/webm':
      return (
        <>
          {settings.autoplay ? (
            <video width="100%" controls muted loop autoPlay>
              <source src={`${image}`} type={nftContentType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <video width="100%" controls muted loop>
              <source src={`${image}`} type={nftContentType} />
              Your browser does not support the video tag.
            </video>
          )}
        </>
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
            /*onError={({ currentTarget }) => {
               currentTarget.onerror = null; // prevents looping
               currentTarget.src = '/img/no-image.png';
            }} */
            fallback={<LoadingSpinner />}
            className="mx-auto w-full"
          />
        </Link>
      );
  }
}

interface Metadata {
  name: string;
  original_image: string;
}

interface Nft {
  amount: string;
  block_number: string;
  block_number_minted: string;
  contract_type: string;
  frozen: number;
  is_valid: number;
  metadata: string & Metadata;
  name: string;
  owner_of: string;
  symbol: string;
  synced_at: string;
  syncing: number;
  token_address: string;
  token_id: string;
  token_uri: string;
}

interface Props {
  chain: string;
  nft: Nft;
}

export default function NFTCard(props: Props) {
  const chain = props.chain;

  const [nft, setNft] = useState<Nft>(null);

  useEffect(() => {
    // process JSON otherwise set NFTs as usual
    try {
      const metadata = JSON.parse(props.nft.metadata);
      const updatedNft = {
        ...props.nft,
        metadata,
      };

      setNft(updatedNft);
    } catch {
      // if JSON parse fails
      setNft(props.nft);
    }
  }, []);

  const colorModeBg = useColorModeValue('bg-white', 'bg-gray-800');
  const colorModeCard = useColorModeValue(
    'bg-gray-50 border-gray-100',
    'bg-gray-700 border-gray-800'
  );

  //console.log('received nft', nft);
  //console.log('received collection', collection);

  if (!nft) return null;

  return (
    <>
    {/* <div className="flex flex-col max-w-sm "> */}
      
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
            className={`p-3 mt-auto border-t rounded-b-lg ${colorModeCard}`}
          >
            <h3 className="text-center font-bold text-lg">
              <Link
                to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
              >
                {/* {nft.metadata && nft.metadata.name} */}
                {nft.metadata && nft.metadata.name}
              </Link>
            </h3>
            <h4 className="text-center text-xs"><Link to={`/${chain}/collection/${nft.token_address}`}>{nft.name ? nft.name : `Unnamed Collection`}</Link></h4>
            <div className="flex justify-between items-center">
              <Button size="xs">
                <Link
                  to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
                >
                  View
                </Link>
              </Button>
              {/* {nft.metadata.original_image && ( */}
              {nft.metadata.original_image ? (
                <Tooltip label="Open original link" openDelay={750} hasArrow>
                  <a
                    // href={nft.metadata.original_image}
                    href={nft.metadata.original_image}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="z-0"
                  >
                    <ExternalLinkIcon boxSize={4} />
                  </a>
                </Tooltip>
              ) : nft.token_uri ? (
                <Tooltip label="Open original link" openDelay={750} hasArrow>
                  <a
                    // href={nft.metadata.original_image}
                    href={nft.token_uri}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                    className="z-0"
                  >
                    <ExternalLinkIcon boxSize={4} />
                  </a>
                </Tooltip> )
              : <></> }
            </div>
          </div>
        </div>
      
    </>
  );
}
