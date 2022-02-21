import { useEffect, useState } from 'react';

// React Router
import { useLocation, useParams } from 'react-router-dom';

import axios from 'axios';

// examples
//http://localhost:3000/collection/0x2953399124f0cbb46d2cbacd8a89cf0599974963/nft/32948694543043279857764542859890323046478235517459735057357541667611082752001

import changeIpfsUrl from '../../utils/changeIpfsUrl';

import { NFTCard } from '../../components/NFTCard/NFTCard';

const API_KEY = process.env['REACT_APP_COVALENT_API_KEY'];

export function Collection(props) {
  // States
  const [address, setAddress] = useState('');

  const [chain, setChain] = useState('');

  const [collection, setCollection] = useState();
  const [collectionMetadata, setcollectionMetadata] = useState();

  // React Router
  let location = useLocation();
  const params = useParams();

  useEffect(() => {
    setAddress(params.contractAddress);
    setChain(params.chain);
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

    // Get 5 latest NFTs
    await axios(
      `/api/collection/nfts?chain=${chain}&address=${address}&limit=5`
    ).then((response) => {
      setcollectionMetadata(response.data);
      props.onLoading(false);
    });
  }

  return (
    <>
      {collection && (
        <div className="grid grid-cols 1 md:grid-cols-2 gap-10">
          <ul>
            <li>{collection.name}</li>
            <li>
              Address:{' '}
              <a
                href={`https://polygonscan.com/address/${collection.token_address}`}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                {collection.token_address}
              </a>
            </li>
            <li>Symbol: {collection.symbol}</li>
          </ul>
        </div>
      )}
      {collectionMetadata && (
        <div>
          <h2 className="text-2xl text-center mb-1">Latest NFTs</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
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
        </div>
      )}
    </>
  );
}
