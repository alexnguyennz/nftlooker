function changeIpfsUrl(metadata) {
  if (metadata.image_url) {
    metadata.image = metadata.image_url;
  }

  // set original image link in metadata to use as a fallback
  metadata.original_image = metadata.image;

  try {
    if (metadata.image.startsWith('ipfs://ipfs/')) {
      // replace any starting protocols e.g. http://, https://
      const image = metadata.image.replace(
        /^.*:\/\//i,
        //'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/'
      );

      //console.log('URL', new URL(metadata.image).host);

      metadata.image = image;
      metadata.original_image = image;

      return metadata;
    } else if (metadata.image.startsWith('ipfs://')) {
      // replace any starting protocols e.g. http://, https://
      const image = metadata.image.replace(
        /^.*:\/\//i,
        //'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/'
      );

      //console.log('URL', new URL(metadata.image).host);

      metadata.image = image;
      metadata.original_image = image;

      return metadata;
    } else if (metadata.image.startsWith('https://gateway.pinata.cloud/')) {
      const image = metadata.image.replace(
        'https://gateway.pinata.cloud/ipfs/',
        //'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/'
      );

      metadata.image = image;
      metadata.original_image = image;

      return metadata;
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = changeIpfsUrl;
