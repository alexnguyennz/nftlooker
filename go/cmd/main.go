package main

import (
	"log"
	"net/http"
	"os"

	"api/internal/routes"

	"github.com/gorilla/mux"   // Router
	"github.com/joho/godotenv" // .env
)



func main() {

	r := mux.NewRouter() // gorilla/mux router

	// LOAD ENV VARIABLES
	err := godotenv.Load()
	if err != nil { log.Fatal("Error loading .env file") }
	
	/***** ROUTES *****/
	/******************/
	r.HandleFunc("/nfts/chain/{chain}/address/{address}", routes.GetWalletNfts)
	r.HandleFunc("/randomwallet", routes.GetRandomWallet)

	r.HandleFunc("/nft/chain/{chain}/address/{address}/id/{tokenId}", routes.GetNft)


	log.Fatal(http.ListenAndServe("localhost:" + os.Getenv("GO_PORT"), r))
}