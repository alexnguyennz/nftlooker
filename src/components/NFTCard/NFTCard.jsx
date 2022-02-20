import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ShareIcon from '@mui/icons-material/Share';

const mime = require('mime-types');

function NFTImage(props) {
  const collection = props.collection;
  const chain = props.chain;

  const nft = props.nft;
  const image = nft.metadata.image || nft.metadata.image_url;
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
          <img src={image} className="mx-auto w-full" />
        </Link>
      );
  }
}

export function NFTCard(props) {
  //const metadata = props.nft.external_data;
  const nft = props.nft;
  const collection = props.collection;
  const chain = props.chain;

  //console.log('received nft', nft);
  //console.log('received collection', collection);

  return (
    <>
      <Card variant="outlined" className=" flex flex-col">
        <CardMedia className="">
          {nft.metadata && (
            <NFTImage collection={collection} nft={nft} chain={chain} />
          )}
        </CardMedia>
        <div className="text-center p-3 pb-0">
          <Typography>
            <Link
              className="text-sm"
              to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
            >
              {nft.metadata && nft.metadata.name}
            </Link>
          </Typography>
        </div>
        <CardActions className="mt-auto justify-end" disableSpacing>
          <Button size="small">
            <Link
              to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
            >
              View
            </Link>
          </Button>
        </CardActions>
      </Card>

      {/* <div className="border-black border p-4 hover:-translate-y-2 transition">
        <div className="">
          {nft.metadata && (
            <NFTImage collection={collection} nft={nft} chain={chain} />
          )}
        </div>

        <div className="text-center py-1">
          <Link
            className="text-sm p-3"
            to={`/${chain}/collection/${nft.token_address}/nft/${nft.token_id}`}
          >
            {nft.metadata && nft.metadata.name}
          </Link>
        </div>
      </div> */}
    </>
  );
}
