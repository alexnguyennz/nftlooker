import { useEffect, useState } from 'react';

// React Router
import { Link, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { Divider } from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';

import changeIpfsUrl from '../../utils/changeIpfsUrl';

import { NFTCard } from '../../components/NFTCard/NFTCard';

const API_KEY = process.env['REACT_APP_COVALENT_API_KEY'];

const mime = require('mime-types');

function NFTImage(props) {
  const collection = props.collection;
  const chain = props.chain;

  const nft = props.nft;
  const image = nft.metadata.image;
  const mimeType = mime.lookup(image);

  switch (mimeType) {
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
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = '/img/404.webp';
            }}
            className="mx-auto w-full"
          />
        </Link>
      );
  }
}

export function Collection(props) {
  // States
  const [address, setAddress] = useState('');

  const [chain, setChain] = useState('');

  const [collection, setCollection] = useState();
  const [collectionMetadata, setcollectionMetadata] = useState();

  const [chainExplorer, setChainExplorer] = useState('etherscan.io');
  const [chainName, setChainName] = useState('');

  // React Router
  let location = useLocation();
  const params = useParams();

  useEffect(() => {
    setAddress(params.contractAddress);
    setChain(params.chain);

    handleChainInfo(params.chain);
  }, [location]);

  useEffect(() => {
    if (address) {
      getData();
    }
  }, [address]);

  async function getData() {
    props.onLoading(true);

    const response = await axios(
      `/api/collection/metadata?chain=${chain}&address=${address}`
    );

    setCollection(response.data);
    // console.log('Collection page:', response.data);

    // Get 5 latest NFTs
    await axios(
      `/api/collection/nfts?chain=${chain}&address=${address}&limit=5`
    ).then((response) => {
      setcollectionMetadata(response.data);
      props.onLoading(false);

      console.log('Collection metadata:', response.data);
    });
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
    setChainName(chainName);
  }

  return (
    <div className="space-y-10">
      {collection && (
        <section className="grid grid-cols 1 md:grid-cols-2 gap-5">
          <div className="mx-auto w-full md:w-3/4">
            {collectionMetadata && (
              <NFTImage nft={collectionMetadata[0]} chain={params.chain} />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="pb-2 border-b border-gray-500 text-4xl font-bold ">
              {collection.name}
            </h3>

            <div className="space-y-5">
              <p>
                CHAIN
                <br />
                <span className="text-2xl">{chainName}</span>
              </p>

              <p>
                CONTRACT
                <br />
                <span className="text-2xl">
                  <a
                    href={`https://${chainExplorer}/address/${collection.token_address}`}
                    target="_blank"
                    rel="noreferrer noopener nofollow"
                  >
                    {collection.token_address}
                    {` `}
                    <ExternalLinkIcon />
                  </a>
                </span>
              </p>

              <p>
                SYMBOL
                <br />
                <span className="text-2xl">{collection.symbol}</span>
              </p>
            </div>
          </div>
        </section>
      )}
      {collectionMetadata && (
        <section>
          <h2 className="mb-1 text-4xl text-center font-bold">Latest NFTs</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {collectionMetadata &&
              collectionMetadata.map((nft) => (
                <NFTCard
                  key={nft.token_id}
                  collection={collection}
                  nft={nft}
                  chain={chain}
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
