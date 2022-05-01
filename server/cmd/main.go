package main

import (
	"api/internal/routes"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func ApiHandler(r *mux.Router) {
	// ResolveAddress
	r.HandleFunc("/resolve/chain/{chain}/address/{address}/limit/{limit}/{cursor}", routes.Resolve)
	r.HandleFunc("/resolve/chain/{chain}/address/{address}/limit/{limit}/", routes.Resolve)

	//Get View Wallet NFTs
	r.HandleFunc("/nfts/wallet/chain/{chain}/address/{address}/limit/{limit}/{cursor}", routes.GetWalletNfts) // if cursor param exists, match it
	r.HandleFunc("/nfts/wallet/chain/{chain}/address/{address}/limit/{limit}/", routes.GetWalletNfts)

	// Get View Collection NFTs
	r.HandleFunc("/nfts/collection/chain/{chain}/address/{address}/limit/{limit}/{cursor}", routes.GetViewCollectionNfts)
	r.HandleFunc("/nfts/collection/chain/{chain}/address/{address}/limit/{limit}/", routes.GetViewCollectionNfts)

	// Search NFTs
	r.HandleFunc("/nfts/search/chain/{chain}/q/{q}/filter/{filter}/limit/{limit}/offset/{offset}", routes.SearchNfts)

	// Get NFT Metadata
	r.HandleFunc("/nft/chain/{chain}/address/{address}/id/{tokenId}", routes.GetNft)

	// Get Collection Metadata
	r.HandleFunc("/collection/metadata/chain/{chain}/address/{address}", routes.GetCollectionMetadata)

	// Get Collection NFTs
	r.HandleFunc("/collection/nfts/chain/{chain}/address/{address}/limit/{limit}/{cursor}", routes.GetCollectionNfts)
	r.HandleFunc("/collection/nfts/chain/{chain}/address/{address}/limit/{limit}/", routes.GetCollectionNfts)

	// Get Random Wallet
	r.HandleFunc("/randomwallet", routes.GetRandomWallet)
}

func main() {

	r := mux.NewRouter() // gorilla/mux router

	// LOAD ENV VARIABLES
	// Development
	//err := godotenv.Load()
	//if err != nil {
	//	log.Fatal("Error loading .env file")
	//}

	api := r.PathPrefix("/api").Subrouter()
	ApiHandler(api)

	// Development
	//log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("GO_PORT"), r))

	// Production
	//
	log.Fatal(http.ListenAndServe(":" + os.Getenv("PORT"), r))
}
