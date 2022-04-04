import { useEffect, useState } from 'react';

// Redux
import { useSelector } from 'react-redux';
import { settingsState } from '../../state/settings/settingsSlice';

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

// change this
import {
  imagekit,
  DEFAULT_IMAGEKIT_IMG,
  cloudinary,
  DEFAULT_CLOUDINARY_IMG,
} from '../../utils/image';

import { Resize } from '@cloudinary/url-gen/actions/resize';

function LoadingSpinner() {
  return (
    <div className="p-10">
      <Spinner w={24} h={24} thickness="8px" speed="0.9s" color="blue.500" />
    </div>
  );
}

function NFTImage(props) {
  //const chain = props.chain;

  //const nft = props.nft;

  const settings = useSelector(settingsState);

  const { chain, nft } = props;
  //let image = nft.metadata.image;

  // console.log('nft', nft.metadata.name, nft.metadata.image);

  //console.log('content type:', nft.metadata.content_type);

  const [image, setImage] = useState('');
  const [nftContentType, setNftContentType] = useState('');

  useEffect(() => {
    getContentType(nft.metadata.image);
  }, []);

  async function getContentType(image) {
    // fetch head only to get Content-Type to render NFT appropriately
    await axios
      .head(image)
      .then((response) => {
        // get contentType
        const contentType = response.headers['content-type'];
        const contentLength = response.headers['content-length'];

        // console.log(nft.metadata.name, response.headers['content-length']);

        generateUrl(contentType, contentLength);
      })
      .catch((err) => console.log(err));
  }

  function generateUrl(type, contentLength) {
    if (type === 'image/gif') {
      // Cloudinary
      // https://res.cloudinary.com/gladius/image/fetch/h_250,w_250/f_mp4/d_no-image_lmfa1g.png/https://www.thehighapesclub.com/assets/nft/invite/THCInvite.gif
      // Cloudinary 10MB Limit
      if (contentLength < 10250000) {
        setImage(
          `https://res.cloudinary.com/gladius/image/fetch/h_250,w_250/f_mp4/d_no-image_lmfa1g.png/${nft.metadata.image}`
        );

        type = 'video/mp4'; // gifs will be outputted as video/mp4
      } else {
        type = 'image/png';

        setImage('/img/no-video.png');
      }

      // ImageKit
      /* setImage(
        imagekit.url({
          src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${image}`,
          transformation: [
            {
              height: '250',
              width: '250',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        })
      ); */
    } else if (type === 'video/mp4' || type === 'video/webm') {
      if (contentLength < 10250000) {
        const stripped = nft.metadata.image.replace(/^.*:\/\//i, '');

        const cloudinaryImage = cloudinary.video(
          `remote_https_media/${stripped}`
        );
        cloudinaryImage.resize(Resize.fit().width(250).height(250));

        let cloudinaryLink = cloudinaryImage.toURL();
        cloudinaryLink = cloudinaryLink + '/d_no-image_lmfa1g.png';

        setImage(cloudinaryLink);
      } else {
        type = 'image/png';

        setImage('/img/no-video.png');
      }

      // ImageKit

      /* setImage(
        imagekit.url({
          src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${nft.metadata.image}`,
          transformation: [
            {
              height: '250',
              width: '250',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        })
      ); */
    } else if (type !== 'model/gltf-binary') {
      // ImageKit
      setImage(
        imagekit.url({
          src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${nft.metadata.image}`,
          transformation: [
            {
              height: '250',
              width: '250',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        })
      );
    } else {
      setImage(
        imagekit.url({
          src: `${process.env.REACT_APP_IMAGEKIT_API_URL}/${nft.metadata.image}`,
          transformation: [
            {
              height: '250',
              width: '250',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        })
      );
    }

    setNftContentType(type);
  }

  //if (!image) return <LoadingSpinner />;

  //switch (mimeType) {
  switch (nftContentType) {
    //switch (nft.metadata.content_type) {
    /* case 'image/gif':
      return (
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ); */
    case 'image/gif':
    case 'video/mp4':
    case 'video/webm':
      return (
        // <video width="100%" controls autoPlay muted loop>
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
