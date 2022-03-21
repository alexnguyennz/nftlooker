// find relevant data in chainQueries array based on chain name
export default function findQuery(queries, chain) {
  const query = queries.find((query) => {
    const queryChain = Object.keys(query.data)[0];
    return queryChain == chain;
  });

  return query.data[chain];
}
