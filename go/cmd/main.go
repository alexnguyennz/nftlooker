package main

import (
	"api/internal/routes"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)


func main() {

	r := mux.NewRouter() // gorilla/mux router

	// LOAD ENV VARIABLES
	err := godotenv.Load()
	if err != nil { log.Fatal("Error loading .env file") }
	
	/***** ROUTES *****/
	/******************/
	r.HandleFunc("/nfts/chain/{chain}/address/{address}", routes.GetWalletNfts)
	r.HandleFunc("/nfts/search/chain/{chain}/q/{q}/filter/{filter}/limit/{limit}/offset/{offset}", routes.SearchNfts)
	//r.HandleFunc("/nfts/search?chain={chain}&q={q}&filter={filter}&limit={limit}&offset={offset}", routes.SearchNfts)

	r.HandleFunc("/nft/chain/{chain}/address/{address}/id/{tokenId}", routes.GetNft)

	r.HandleFunc("/collection/metadata/chain/{chain}/address/{address}", routes.GetCollectionMetadata)
	r.HandleFunc("/collection/nfts/chain/{chain}/address/{address}/limit/{limit}/offset/{offset}", routes.GetCollectionNfts)

	r.HandleFunc("/randomwallet", routes.GetRandomWallet)

	log.Fatal(http.ListenAndServe("localhost:" + os.Getenv("GO_PORT"), r))
}