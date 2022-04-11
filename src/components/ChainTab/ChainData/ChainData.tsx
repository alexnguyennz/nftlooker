import React, { useEffect, useState } from 'react';

import NFTCollection from '../../NFTCollection/NFTCollection';

interface ChainProps {
  name: string;
  loaded: boolean;
  count: number;
  order: number;
}

interface Chain {
  [key: string]: ChainProps;
}

interface Props {
  chain: ChainProps;
}

function ChainData(props: Props) {
  const data = Object.values(props.chain)[0].data;

  const chain = Object.keys(props.chain)[0];

  //console.log(`${props.memo ? '<MemoizedChainData>' : '<ChainData>'} rendered`);

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

export default React.memo(ChainData);
