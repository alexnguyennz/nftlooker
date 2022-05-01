package routes

import (
	"context"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gorilla/mux"
	"github.com/unstoppabledomains/resolution-go"
	"github.com/wealdtech/go-ens/v3"
)

func Resolve(w http.ResponseWriter, r *http.Request) {

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]
	limit := vars["limit"]
	cursor := vars["cursor"]

	resolvedAddress := address

	// Router
	router := mux.NewRouter()
	router.HandleFunc("/api/nfts/wallet/chain/{chain}/address/{address}/limit/{limit}/{cursor}", GetWalletNfts).Name("WalletNftsCursor")
	router.HandleFunc("/api/nfts/wallet/chain/{chain}/address/{address}/limit/{limit}/", GetWalletNfts).Name("WalletNfts")
	router.HandleFunc("/api/nfts/collection/chain/{chain}/address/{address}/limit/{limit}/{cursor}", GetCollectionNfts).Name("CollectionNftsCursor")
	router.HandleFunc("/api/nfts/collection/chain/{chain}/address/{address}/limit/{limit}/", GetCollectionNfts).Name("CollectionNfts")

	route := func(routeName string) {

		if cursor != "" {
			url, _ := router.Get(routeName+"Cursor").URL("chain", chain, "address", resolvedAddress, "limit", limit, "cursor", cursor)

			//fmt.Println("call", url.String())
			http.Redirect(w, r, url.String(), http.StatusFound)
		} else {
			url, _ := router.Get(routeName).URL("chain", chain, "address", resolvedAddress, "limit", limit, "cursor", cursor)

			//fmt.Println("call", url.String())
			http.Redirect(w, r, url.String(), http.StatusFound)
		}
	}

	if strings.HasPrefix(address, "0x") {

		// Check if address is valid
		re := regexp.MustCompile("^0x[0-9a-fA-F]{40}$")
		if re.MatchString(address) {

			// Connect to correct chain node to determine if the address is a contract on that chain
			// Send to different endpoint
			client, err := ethclient.Dial(`https://speedy-nodes-nyc.moralis.io/` + os.Getenv("MORALIS_API_NODE") + `/` + chain + `/mainnet`) // /archive
			if err != nil {
				panic(err)
			}

			// Check if address is a contract
			address := common.HexToAddress(resolvedAddress)
			bytecode, err := client.CodeAt(context.Background(), address, nil) // nil = latest block
			isContract := len(bytecode) > 0

			if isContract {
				route("CollectionNfts")
			} else {
				route("WalletNfts")
			}

			if err != nil {
				route("WalletNfts") // Use Wallet Nfts as fallback if node connection fails
				//log.Panic("Test", err, chain)
			}

		} else {
			w.WriteHeader(http.StatusBadRequest)
			// 	w.Write([]byte(`{"data":{}}`))
		}

	} else if strings.HasSuffix(address, ".eth") {

		// connect to Ethereum mainnet client
		client, err := ethclient.Dial(`https://mainnet.infura.io/v3/` + os.Getenv("INFURA_API_ID"))
		if err != nil {
			panic(err)
		}

		address, err := ens.Resolve(client, address) // resolve address

		//fmt.Println("resolved", address)

		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
		}

		resolvedAddress = address.String()

		//fmt.Println("resolved test", resolvedAddress)

		route("WalletNfts")

	} else {
		// Unstoppable domains
		uns, _ := resolution.NewUnsBuilder().Build()
		unsAddress, err := uns.Addr(address, "ETH")

		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
		}

		resolvedAddress = unsAddress

		route("WalletNfts")

	}
}
