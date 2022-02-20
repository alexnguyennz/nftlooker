function changeIpfsUrl(metadata) {
  if (metadata.image_url) {
    if (metadata.image_url.startsWith('ipfs://')) {
      // replace any starting protocols e.g. http://, https://
      const image = metadata.image_url.replace(
        /^.*:\/\//i,
        //'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/'
      );

      metadata.image_url = image;

      return metadata;
    }
  } else if (metadata.image) {
    if (metadata.image.startsWith('ipfs://ipfs/')) {
      // replace any starting protocols e.g. http://, https://
      const image = metadata.image.replace(
        /^.*:\/\//i,
        //'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/'
      );

      //console.log('URL', new URL(metadata.image).host);

      metadata.image = image;

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

      return metadata;
    } else if (metadata.image.startsWith('https://gateway.pinata.cloud/')) {
      const image = metadata.image.replace(
        'https://gateway.pinata.cloud/ipfs/',
        //'https://cloudflare-ipfs.com/ipfs/',
        'https://ipfs.io/ipfs/'
      );

      metadata.image = image;

      return metadata;
    }
  }
}

module.exports = changeIpfsUrl;
