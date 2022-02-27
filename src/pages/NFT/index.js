import { useEffect, useState } from 'react';

import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { useToast, Button } from '@chakra-ui/react';

import { ArrowBackIcon } from '@chakra-ui/icons';

import ModelViewer from '@google/model-viewer'; // 3D models

import { useColorMode, useColorModeValue } from '@chakra-ui/react';

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';

import toast from '../../components/Toast/Toast';

import truncateAddress from '../../utils/ellipseAddress';

// IPFS EXAMPLE
// http://localhost:3000/collection/0x2953399124f0cbb46d2cbacd8a89cf0599974963/nft/51457428668762326190474255981562178405831810566835418606623410388040178204673

const mime = require('mime-types');

export function NFT(props) {
  const [address, setAddress] = useState('');

  const [loaded, setLoaded] = useState(false);

  const [chain, setChain] = useState('');

  const [tokenId, setTokenId] = useState('');
  const [nft, setNft] = useState();

  const [chainExplorer, setChainExplorer] = useState('etherscan.io');

  const toastInstance = useToast();

  const colorModeBg = useColorModeValue('white', '#1f2937');

  let nftElem;

  // React Router
  let location = useLocation();
  let params = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    setChain(params.chain);
    setAddress(params.contractAddress);
    setTokenId(params.tokenId);

    handleChainInfo(params.chain);
  }, [location]);

  useEffect(() => {
    if (address && tokenId) {
      getData();
    }
  }, [address]);

  useEffect(() => {
    console.log(nft);
  }, [nft]);

  useEffect(() => {
    if (loaded) {
      const nftElemTest = document.querySelector('img');

      nftElem = nftElemTest;

      console.log('elem', nftElemTest);

      try {
        if (nftElemTest.complete) {
          console.log('img loaded');
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, [loaded]);

  async function getData() {
    props.onLoading(true);

    try {
      await axios(
        `/api/nft?chain=${chain}&address=${address}&tokenId=${tokenId}`
      ).then((response) => {
        setNft(response.data);
        props.onLoading(false);
        setLoaded(true);
      });
    } catch (err) {
      console.log(err);
    }
  }

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

  // filter based on MIME type
  function NFTImage(props) {
    const nft = props.nft;
    const image = props.image;
    const mimeType = mime.lookup(image);

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

          {/*<ReactPlayer
            id="video-player"
            url={image}
            width="100%"
            controls="true"
            playing="true"
            muted="true"
            loop="true"
            pip="true"
            stopOnUnmount={false} // continue playing PIP after ReactPlayer unmounts
            // fallback
          />*/}

          <div className="mt-3 text-right">
            <Button onClick={pip} colorScheme="blue">
              PIP
            </Button>
          </div>
        </>
      );
    }

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
              src="/img/membership.glb"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              environment-image="neutral"
              poster="poster.webp"
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
            href={nft.metadata.original_image}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <img src={image} className="mx-auto w-full" />
          </a>
        );
    }
  }

  function handleChainInfo(chain) {
    let chainExplorer;
    let chainName;

    switch (chain) {
      case 'eth':
        chainExplorer = 'etherscan.io';
        chainName = 'Ethereum';
        break;
      case 'matic':
        chainExplorer = 'polygonscan.com';
        chainName = 'Polygon';

        break;
      case 'binance':
        chainExplorer = 'bscscan.com';
        chainName = 'Binance';
        break;
      case 'avalanche':
        chainExplorer = 'snowtrace.io';
        chainName = 'Avalanche';
        break;
      case 'fantom':
        chainExplorer = 'ftmscan.com';
        chainName = 'Fantom';
        break;
    }

    setChainExplorer(chainExplorer);
  }

  return (
    <div className="space-y-10">
      {nft && !props.loading && (
        <section className="grid grid-cols 1 md:grid-cols-2 gap-5">
          <div className="mx-auto w-full md:w-3/4">
            <NFTImage
              nft={nft}
              chain={params.chain}
              image={nft.metadata && nft.metadata.image}
            />
          </div>
          <div>
            <h3 className="pb-2 border-b border-gray-500 text-4xl font-bold ">
              {nft.metadata.name}
            </h3>

            <div className="space-y-5">
              <div>
                DESCRIPTION
                <br />
                <span className="text-2xl">
                  {nft.metadata.description ? (
                    <>{nft.metadata.description}</>
                  ) : (
                    <>None</>
                  )}
                </span>
              </div>

              {nft.metadata.attributes && (
                <div>
                  ATTRIBUTES
                  <br />
                  <div className="text-2xl">
                    {nft.metadata.attributes.map((attribute, idx) => {
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

              {nft.metadata.external_url && (
                <div>
                  <ExternalLinkIcon />
                  <br />
                  <span className="text-2xl">
                    <a
                      href={nft.metadata.external_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {nft.metadata.external_url}
                    </a>
                  </span>
                </div>
              )}

              <div>
                OWNER
                <br />
                <span className="text-2xl">
                  <a
                    href={`https://${chainExplorer}/address/${nft.owner_of}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {truncateAddress(nft.owner_of)}
                  </a>
                </span>
              </div>
              <div>
                COLLECTION
                <br />
                <span className="text-2xl">
                  <Link to={`/${chain}/collection/${nft.token_address}`}>
                    <ArrowBackIcon /> {nft.name}
                  </Link>
                </span>
              </div>
              <div>
                CONTRACT
                <br />
                <span className="text-2xl">
                  <a
                    href={`https://polygonscan.com/address/${nft.token_address}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {truncateAddress(nft.token_address)}
                  </a>
                </span>
              </div>
              <div>
                TOKEN ID
                <br />
                <span className="text-2xl break-all">{nft.token_id}</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
