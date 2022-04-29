// ENS Domains
const ethers = require('ethers');
const web3Provider = new ethers.providers.InfuraProvider('homestead', {
  projectId: process.env.INFURA_API_ID,
  projectSecret: process.env.INFURA_API_SECRET,
});

// Unstoppable Domains
const { default: Resolution } = require('@unstoppabledomains/resolution');
const resolution = new Resolution();

// resolve domain to 0x address
async function resolveDomain(address) {
  let resolvedAddress = address;

  // resolve domains
  if (address.startsWith('0x')) {
    return await resolvedAddress;
  } else if (address.endsWith('.eth')) {
    // ENS
    resolvedAddress = await web3Provider.resolveName(address);
    return await resolvedAddress;
  } else {
    // Unstoppable Domains
    return await resolution
      .addr(address, 'eth')
      .then((address) => {
        resolvedAddress = address;
        return resolvedAddress;
      })
      .catch(console.error);
  }
}

/* async function resolveAddress(address) {
  let resolvedDomain = address;

  // ENS
  resolvedDomain = await web3Provider.lookupAddress(address);
  return resolvedDomain;
} */

module.exports = resolveDomain;
