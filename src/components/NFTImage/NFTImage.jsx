import { useToast, useColorModeValue, Button } from '@chakra-ui/react';

import toast from '../../components/Toast/Toast';

//const mime = require('mime-types');

export default function NFTImage(props) {
  const nft = props.nft;
  const image = props.image;
  //const mimeType = mime.lookup(image);

  const toastInstance = useToast();
  const colorModeBg = useColorModeValue('white', '#1f2937');

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

  function pip() {
    const elem = document.querySelector('video');

    elem.requestPictureInPicture();
  }

  function Video(props) {
    return (
      <>
        <video width="100%" controls autoPlay muted loop>
          <source src={`${image}`} type={props.mime} />
        </video>

        <div className="mt-3 text-right">
          <Button onClick={pip} colorScheme="blue">
            PIP
          </Button>
        </div>
      </>
    );
  }

  const mimeType = 'test';

  switch (mimeType) {
    case 'image/gif':
      return <Video mime="video/mp4" />;
    case 'video/mp4':
      return <Video mime="video/mp4" />;
    case 'video/webm':
      return <Video mime="video/webm" />;
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
    default:
      return (
        <a
          href={nft.metadata.original_image && nft.metadata.original_image}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          <img src={image} className="mx-auto w-full" />
        </a>
      );
  }
}
