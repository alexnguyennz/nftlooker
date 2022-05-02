import NFTCard from '../NFTCard/NFTCard';

export default function NFTCollection(props) {
  const collection = props.collection;
  const chain = props.chain;

  return (
    <>
      {collection.map((nft, idx) => (
        <NFTCard key={idx} nft={nft} chain={chain} />
      ))}
    </>
  );
}
