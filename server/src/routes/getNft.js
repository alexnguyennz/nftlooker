// IMPORTS
const axios = require('axios');
require('dotenv').config();

// UTILITIES
const {
  cloudinary,
  imagekit,
  DEFAULT_CLOUDINARY_IMG,
  DEFAULT_IMAGEKIT_IMG,
} = require('../utils/image.js');
const changeIpfsUrl = require('../utils/changeIpfsUrl.js');
const resolveDomain = require('../utils/resolve.js');

// Moralis GetTokenIdMetadata
const getNft = async (req, res) => {
  const { chain, address, tokenId } = req.query;

  const response = await axios.get(
    `${process.env.MORALIS_API_URL}/nft/${address}/${tokenId}?chain=${chain}&format=decimal`,
    {
      headers: {
        accept: 'application/json',
        'X-API-KEY': process.env.MORALIS_API_KEY,
      },
    }
  );

  // try resolving
  /* const test = await resolveAddress(
    '0xA1b02d8c67b0FDCF4E379855868DeB470E169cfB'
  ); */
  //console.log('address', test);

  const metadataResponse = await axios.get(response.data.token_uri);

  const metadata = metadataResponse.data;

  if (typeof metadata === 'object' && metadata !== null) {
    // format IPFS links

    changeIpfsUrl(metadata);

    if (metadata.image) {
      if (metadata.image.startsWith('data:image')) {
        //console.log('data:image');
      } else if (metadata.image.endsWith('.gif')) {
        // Cloudinary
        metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',
          transformation: [
            { width: 1000, height: 1000 },
            { fetch_format: 'mp4' },
          ],
          default_image: DEFAULT_CLOUDINARY_IMG,
        });
      } else if (
        metadata.image.endsWith('.mp4') ||
        metadata.image.endsWith('.webm')
      ) {
        const stripped = metadata.image.replace(/^.*:\/\//i, '');
        // Cloudinary
        metadata.image = cloudinary.url(`remote_https_media/${stripped}`, {
          resource_type: 'video',
          transformation: [{ width: 1000, height: 750 }], // 4/3
          default_image: DEFAULT_CLOUDINARY_IMG,
        });
      } else if (
        !metadata.image.endsWith('.glb') &&
        !metadata.image.endsWith('.gitf')
      ) {
        // Cloudinary
        /*metadata.image = cloudinary.url(metadata.image, {
          type: 'fetch',
          transformation: [
            { width: 250, height: 250 },
            { fetch_format: 'auto' },
          ],
          quality: 'auto',
          default_image: DEFAULT_IMG,
        }); */

        // ImageKit
        metadata.image = imagekit.url({
          src: `${process.env.IMAGEKIT_API_URL}/${metadata.image}`,
          transformation: [
            {
              height: '1000',
              width: '1000',
              defaultImage: DEFAULT_IMAGEKIT_IMG,
            },
          ],
        });
      }
    }

    const nft = {
      ...response.data,
      metadata,
    };

    //console.log('metadata', nft);

    res.send(nft);
  } else {
    return null;
  }
};

module.exports = getNft;
