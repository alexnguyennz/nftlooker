function changeIpfsUrl(metadata) {
  if (metadata.image_url) {
    metadata.image = metadata.image_url;
  }

  // set original image link in metadata to use as a fallback
  metadata.original_image = metadata.image;

  try {
    if (metadata.image.startsWith('ipfs://ipfs/')) {
      // replace any starting protocols e.g. http://, https://
      metadata.original_image = metadata.image;

      metadata.backup_image = metadata.image.replace(
        /^.*:\/\//i,
        'https://cf-ipfs.com/'
      );
      metadata.image = metadata.image.replace(/^.*:\/\//i, 'https://ipfs.io/');
    } else if (metadata.image.startsWith('ipfs://')) {
      // replace any starting protocols e.g. http://, https://
      metadata.original_image = metadata.image;

      metadata.backup_image = metadata.image.replace(
        /^.*:\/\//i,
        'https://cf-ipfs.com/ipfs'
      );
      metadata.image = metadata.image.replace(
        /^.*:\/\//i,
        'https://ipfs.io/ipfs/'
      );
    } else if (metadata.image.startsWith('https://gateway.pinata.cloud/')) {
      // replace any starting protocols e.g. http://, https://
      metadata.original_image = metadata.image;

      metadata.backup_image = metadata.image.replace(
        'https://gateway.pinata.cloud/ipfs/',
        'https://cf-ipfs.com/ipfs'
      );

      metadata.image = metadata.image.replace(
        'https://gateway.pinata.cloud/ipfs/',
        'https://ipfs.io/ipfs/'
      );
    }

    return metadata;
  } catch (err) {
    console.log(err);
    return metadata;
  }
}

module.exports = changeIpfsUrl;
