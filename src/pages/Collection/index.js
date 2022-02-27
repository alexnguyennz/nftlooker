import { useEffect, useState } from 'react';

// React Router
import { Link, useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

import { Divider } from '@chakra-ui/react';

import { ExternalLinkIcon } from '@chakra-ui/icons';

import changeIpfsUrl from '../../utils/changeIpfsUrl';

import { NFTCard } from '../../components/NFTCard/NFTCard';

import truncateAddress from '../../utils/ellipseAddress';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

import ReactPaginate from 'react-paginate';

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

  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    console.log('loaded', loaded);
    console.log('metadata', collectionMetadata);
  }, [loaded]);

  async function getData() {
    props.onLoading(true);
    setLoaded(false);

    let response = await axios
      .get(`/api/collection/metadata?chain=${chain}&address=${address}`)
      .catch((err) => console.log(err));

    setCollection(response.data);

    // Get latest NFTs
    response = await axios
      .get(`/api/collection/nfts?chain=${chain}&address=${address}&limit=50`)
      .catch((err) => console.log(err));

    setcollectionMetadata(response.data);
    props.onLoading(false);
    setLoaded(true);
  }

  function handleChainInfo(chain) {
    let chainExplorer;
    let chainName;

    switch (chain) {
      case 'eth':
        chainExplorer = 'etherscan.io';
        chainName = 'Ethereum (ETH)';
        break;
      case 'matic':
        chainExplorer = 'polygonscan.com';
        chainName = 'Polygon (MATIC)';

        break;
      case 'binance':
        chainExplorer = 'bscscan.com';
        chainName = 'Binance Smart Chain (BSC)';
        break;
      case 'avalanche':
        chainExplorer = 'snowtrace.io';
        chainName = 'Avalanche (AVAX)';
        break;
      case 'fantom':
        chainExplorer = 'ftmscan.com';
        chainName = 'Fantom (FTM)';
        break;
    }

    setChainExplorer(chainExplorer);
    setChainName(chainName);
  }

  function Items({ currentItems }) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
        {currentItems &&
          currentItems.map((nft) => (
            <NFTCard
              key={nft.token_id}
              collection={collection}
              nft={nft}
              chain={chain}
            />
          ))}
      </div>
    );
  }

  function PaginatedItems({ itemsPerPage }) {
    const items = collectionMetadata;

    // We start with an empty list of items.
    const [currentItems, setCurrentItems] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);

    useEffect(() => {
      // Fetch items from another resources.
      const endOffset = itemOffset + itemsPerPage;
      setCurrentItems(items.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(items.length / itemsPerPage));
    }, [itemOffset, itemsPerPage]);

    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % items.length;
      setItemOffset(newOffset);
    };

    return (
      <>
        <Items currentItems={currentItems} />
        <ReactPaginate
          nextLabel="Next"
          onPageChange={handlePageClick}
          pageRangeDisplayed={3}
          marginPagesDisplayed={2}
          pageCount={pageCount}
          previousLabel="Previous"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          renderOnZeroPageCount={null}
        />
      </>
    );
  }

  return (
    <div className="space-y-10">
      {loaded && collection && (
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
                    {truncateAddress(collection.token_address)}
                    {` `}
                    <ExternalLinkIcon />
                  </a>
                </span>
              </p>

              <p>
                SYMBOL / TICKER
                <br />
                <span className="text-2xl">{collection.symbol}</span>
              </p>
            </div>
          </div>
        </section>
      )}
      {collectionMetadata && (
        <section>{loaded && <PaginatedItems itemsPerPage={5} />}</section>
      )}
    </div>
  );
}

{
  /*<h2 className="mb-1 text-4xl text-center font-bold">Latest NFTs</h2>*/
}
{
  /*<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {collectionMetadata &&
              collectionMetadata.map((nft) => (
                <NFTCard
                  key={nft.token_id}
                  collection={collection}
                  nft={nft}
                  chain={chain}
                />
              ))}
              </div>*/
}
