package resolve

import (
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/unstoppabledomains/resolution-go"
	"github.com/wealdtech/go-ens/v3"
	//"github.com/unstoppabledomains/resolution-go"
)

func ResolveDomain(domain string) (string, error) {

	resolvedAddress := domain

	// 	 // resolve domains
	// 	 if (address.startsWith('0x')) {
	//     return await resolvedAddress;
	//   } else if (address.endsWith('.eth')) {
	//     // ENS
	//     resolvedAddress = await web3Provider.resolveName(address);
	//     return await resolvedAddress;
	//   } else {
	//     // Unstoppable Domains
	//     return await resolution
	//       .addr(address, 'eth')
	//       .then((address) => {
	//         resolvedAddress = address;
	//         return resolvedAddress;
	//       })
	//       .catch(console.error);
	//   }
	// }

	if strings.HasPrefix(domain, "0x") {
		return resolvedAddress, nil
	} else if strings.HasSuffix(domain, ".eth") {

		// connect to Ethereum mainnet client
		client, err := ethclient.Dial(`https://mainnet.infura.io/v3/` + os.Getenv("INFURA_API_ID"))
		if err != nil {
			panic(err)
		}

		address, _ := ens.Resolve(client, domain) // resolve address

		resolvedAddress = ens.Format(client, address) // convert to string

		return resolvedAddress, nil
	} else {
		// Unstoppable domains
		uns, _ := resolution.NewUnsBuilder().Build()
		resolvedAddress, _ = uns.Addr(domain, "ETH")
		return resolvedAddress, nil
	}


}