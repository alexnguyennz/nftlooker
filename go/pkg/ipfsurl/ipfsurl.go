package ipfsurl

import (
	"net/url"
	"strings"
)

func ChangeIpfsUrl(nftUrl string) string {
	
			// parse image URL
			u, _ := url.Parse(nftUrl)

			if strings.HasPrefix(nftUrl, "ipfs://ipfs/") {

				u.Scheme = "https"
				u.Path = "/ipfs" + u.Path // prepend /ipfs/ path to CID
				u.Host = "ipfs.io"

			} else if strings.HasPrefix(nftUrl, "ipfs://") {

				u.Scheme = "https"
				u.Path = "/ipfs/" + u.Host // prepend /ipfs/ path to CID
				u.Host = "ipfs.io"

			} else if strings.HasPrefix(nftUrl, "https://gateway.pinata.cloud/") {
				u.Host = "ipfs.io"
			
			} else {
				u.Host = "TESTINGCHANGETHIS.IO"
			}

			return u.String()
		
}

// changeIpfsUrl