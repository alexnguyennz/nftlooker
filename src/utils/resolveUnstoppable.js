const { default: Resolution } = require('@unstoppabledomains/resolution');
const resolution = new Resolution();

export default function resolveUnstoppable(domain, currency) {
  resolution
    .addr(domain, currency)
    .then((address) => {
      console.log(domain, 'resolves to', address);

      return address;
    })
    .catch(console.error);
}
