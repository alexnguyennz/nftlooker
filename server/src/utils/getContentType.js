const axios = require('axios');

const contentType = require('content-type');

async function getContentType(link) {
  // Get Content Type
  const metadataImage = await axios(link).catch((err) => console.log(err));

  const type = contentType.parse(metadataImage);
  console.log('contentType', type.type);

  return type.type;
}

module.exports = getContentType;
