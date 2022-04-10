import { useEffect, useState } from 'react';

// Redux
import { useSelector } from 'react-redux';
import { settingsState } from '../../state/settings/settingsSlice';

import { Link } from 'react-router-dom';

// Components
import {
  useToast,
  useColorModeValue,
  Image,
  Button,
  Spinner,
} from '@chakra-ui/react';

import toast from '../../components/Toast/Toast';

import ModelViewer from '@google/model-viewer';

// Image Transformation
import generateNftUrl from '../../utils/generateNftUrl';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

export default function NFTImage(props) {
  //const nft = props.nft;
  //const image = props.image;

  const settings = useSelector(settingsState);

  const { chain, nft } = props;

  const [image, setImage] = useState('');
  const [nftContentType, setNftContentType] = useState('');

  const toastInstance = useToast();
  const colorModeBg = useColorModeValue('white', '#1f2937');

  useEffect(() => {
    async function generateUrl() {
      const { image, contentType } = await generateNftUrl(
        nft.metadata.image,
        '1000'
      );

      setImage(image);
      setNftContentType(contentType);
    }

    generateUrl();
  }, []);

  function fullScreen() {
    const elem = document.querySelector('model-viewer');

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        toast(
          toastInstance,
          'error',
          'Error attempting to enter fullscreen mode.',
          `${err}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }

  switch (nftContentType) {
    case 'image/gif':
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
        <>
          <model-viewer
            id="nft-model"
            bounds="tight"
            src={image}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            environment-image="neutral"
            // poster="poster.webp"
            shadow-intensity="1"
            autoplay
          ></model-viewer>
          <div className="mt-3 text-right">
            <Button onClick={fullScreen} colorScheme="blue">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill={colorModeBg}
              >
                <path
                  fillRule="evenodd"
                  d="M1 1v6h2V3h4V1H1zm2 12H1v6h6v-2H3v-4zm14 4h-4v2h6v-6h-2v4zm0-16h-4v2h4v4h2V1h-2z"
                />
              </svg>
            </Button>
          </div>
        </>
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
        <a
          href={nft.metadata.original_image && nft.metadata.original_image}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <Image
            src={image}
            fallback={<LoadingSpinner />}
            className="mx-auto w-full"
          />
        </a>
      );
  }
}
