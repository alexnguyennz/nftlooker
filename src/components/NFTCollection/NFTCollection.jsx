import { Link } from 'react-router-dom';

import { NFTCard } from '../NFTCard/NFTCard';

import s from './NFTCollection.module.css';

export function NFTCollection(props) {
  const collection = props.collection;
  const chain = props.chain;

  //console.log('chain', props.chain);

  return (
    <section className={`space-y-1`}>
      <h3 className="tracking-wide text-left text-lg font-semibold">
        <Link to={`/${chain}/collection/${collection[0].token_address}`}>
          {collection[0].name}
        </Link>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-10">
        {collection.map((nft, idx) => (
          <NFTCard key={idx} collection={collection} nft={nft} chain={chain} />
        ))}
      </div>
    </section>
  );
}
