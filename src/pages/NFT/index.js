import { useEffect, useState } from 'react';

import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { useToast, Button } from '@chakra-ui/react';

import { ArrowBackIcon } from '@chakra-ui/icons';

import ModelViewer from '@google/model-viewer';

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

  const toast = useToast();
  const statuses = ['success', 'error', 'warning', 'info'];

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
    const elem = document.getElementById('nft-model');

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        toast({
          title: 'Error attempting to enter fullscreen mode.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
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

    switch (mimeType) {
      case 'video/mp4':
        return (
          <video width="100%" controls autoPlay muted loop>
            <source src={`${image}`} type="video/mp4" />
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
            <Button onClick={fullScreen}>Fullscreen</Button>
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
          <div className="space-y-2">
            <h3 className="pb-2 border-b border-gray-500 text-4xl font-bold ">
              {nft.metadata.name}
            </h3>

            <div className="space-y-5">
              <p>
                DESCRIPTION
                <br />
                <span className="text-2xl">
                  {nft.metadata.description ? (
                    <>{nft.metadata.description}</>
                  ) : (
                    <>None</>
                  )}
                </span>
              </p>

              <p>
                OWNER
                <br />
                <span className="text-2xl">
                  <a
                    href={`https://${chainExplorer}/address/${nft.owner_of}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {nft.owner_of}
                  </a>
                </span>
              </p>
              <p>
                COLLECTION
                <br />
                <span className="text-2xl">
                  <Link to={`/${chain}/collection/${nft.token_address}`}>
                    <ArrowBackIcon /> {nft.name}
                  </Link>
                </span>
              </p>
              <p>
                CONTRACT
                <br />
                <span className="text-2xl">
                  <a
                    href={`https://polygonscan.com/address/${nft.token_address}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {nft.token_address}
                  </a>
                </span>
              </p>
              <p>
                TOKEN ID
                <br />
                <span className="text-2xl break-all">{nft.token_id}</span>
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
