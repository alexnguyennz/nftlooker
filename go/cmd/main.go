package main

import (
	"api/internal/routes"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)


func main() {

	r := mux.NewRouter() // gorilla/mux router

	// LOAD ENV VARIABLES
	// Development
	// err := godotenv.Load()
	// if err != nil { log.Fatal("Error loading .env file") }
	
	// Get Wallet NFTs
	r.HandleFunc("/api/nfts/chain/{chain}/address/{address}", routes.GetWalletNfts)

	// Search NFTs
	r.HandleFunc("/api/nfts/search/chain/{chain}/q/{q}/filter/{filter}/limit/{limit}/offset/{offset}", routes.SearchNfts)
	
	// Get NFT Metadata
	r.HandleFunc("/api/nft/chain/{chain}/address/{address}/id/{tokenId}", routes.GetNft)
	
	// Get Collection Metadata
	r.HandleFunc("/api/collection/metadata/chain/{chain}/address/{address}", routes.GetCollectionMetadata)
	
	// Get Collection NFTs
	r.HandleFunc("/api/collection/nfts/chain/{chain}/address/{address}/limit/{limit}/offset/{offset}", routes.GetCollectionNfts)
	
	// Get Random Wallet
	r.HandleFunc("/api/randomwallet", routes.GetRandomWallet)

	// Development 
	//log.Fatal(http.ListenAndServe("localhost:" + os.Getenv("GO_PORT"), r))

	// Production
	log.Fatal(http.ListenAndServe(":" + os.Getenv("PORT"), r))
}