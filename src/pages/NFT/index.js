import { useEffect, useState } from 'react';

import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { ArrowBackIcon } from '@chakra-ui/icons';

// IPFS EXAMPLE
// http://localhost:3000/collection/0x2953399124f0cbb46d2cbacd8a89cf0599974963/nft/51457428668762326190474255981562178405831810566835418606623410388040178204673

const mime = require('mime-types');

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
    <div className="space-y-10">
      {nft && (
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
                <span className="text-2xl">{nft.metadata.description}</span>
              </p>

              <p>
                OWNER
                <br />
                <span className="text-2xl">
                  <a
                    href={`https://polygonscan.com/address/${nft.owner_of}`}
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
