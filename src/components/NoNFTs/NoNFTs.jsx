export default function NoNFTs(props) {
  if (!props.noNfts) return null;

  return (
    <p className="mt-10 font-bold text-2xl text-center">
      No NFTs found :(
      <img
        src="/img/sad-chocobo.png"
        alt="no NFTs found image"
        className="mx-auto mt-10"
        width="250"
      />
    </p>
  );
}
