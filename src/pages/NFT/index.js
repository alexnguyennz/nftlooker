import { useEffect, useState } from 'react';

import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

// IPFS EXAMPLE
// http://localhost:3000/collection/0x2953399124f0cbb46d2cbacd8a89cf0599974963/nft/51457428668762326190474255981562178405831810566835418606623410388040178204673

const mime = require('mime-types');

// filter based on MIME type
function NFTImage(props) {
  const image = props.image;
  const mimeType = mime.lookup(image);

  switch (mimeType) {
    case 'video/mp4':
      return (
        <video width="100%" controls>
          <source src={`${image}`} type="video/mp4" />
        </video>
      );
    default:
      return (
        <a href={image} target="_blank" rel="noopener noreferrer nofollow">
          <img src={image} className="mx-auto w-full" />
        </a>
      );
  }
}

export function NFT(props) {
  const [address, setAddress] = useState('');

  const [chain, setChain] = useState('');

  const [tokenId, setTokenId] = useState('');
  const [nft, setNft] = useState();

  // React Router
  let location = useLocation();
  let params = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    setChain(params.chain);
    setAddress(params.contractAddress);
    setTokenId(params.tokenId);
  }, [location]);

  useEffect(() => {
    if (address && tokenId) {
      getData();
    }
  }, [address]);

  async function getData() {
    props.onLoading(true);

    try {
      await axios(
        `/api/nft?chain=${chain}&address=${address}&tokenId=${tokenId}`
      ).then((response) => {
        setNft(response.data);
        props.onLoading(false);
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      {nft && (
        <>
          <div className="text-center mb-5">
            <button
              className="text-xl font-semibold"
              onClick={() =>
                navigate(
                  `/${params.chain}/collection/${params.contractAddress}`
                )
              }
            >
              &#60; To Collection
            </button>
          </div>
          <div className="grid grid-cols 1 md:grid-cols-2 gap-10">
            <div className="mx-auto w-3/4">
              <NFTImage
                nft={nft}
                image={
                  nft.metadata && (nft.metadata.image || nft.metadata.image_url)
                }
              />
            </div>
            <ul className="space-y-2">
              <li className="text-2xl font-semibold">{nft.metadata.name}</li>
              <li>
                Collection:{' '}
                <Link to={`/${chain}/collection/${nft.token_address}`}>
                  {nft.name}
                </Link>
              </li>
              <li>{nft.metadata.description}</li>
              <li>
                Owner:{' '}
                <a
                  href={`https://polygonscan.com/address/${nft.owner_of}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {nft.owner_of}
                </a>
              </li>
              <li>
                Contract Address:{' '}
                <a
                  href={`https://polygonscan.com/address/${nft.token_address}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {nft.token_address}
                </a>
              </li>
              <li>Token ID: {nft.token_id}</li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}
