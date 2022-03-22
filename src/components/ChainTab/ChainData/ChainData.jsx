import { NFTCollection } from '../../NFTCollection/NFTCollection';

export default function ChainData(props) {
  const data = Object.values(props.chain)[0].data;

  const chain = Object.keys(props.chain)[0];

  return (
    <div className="grid gap-5">
      {Object.keys(data).map((collection) => (
        <NFTCollection
          key={collection}
          collection={data[collection]}
          chain={chain}
        />
      ))}
    </div>
  );
}
