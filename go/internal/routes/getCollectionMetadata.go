package routes

import (
	"api/pkg/request"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)


func GetCollectionMetadata(w http.ResponseWriter, r *http.Request) {

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]

	// Moralis GETNFTMetadata https://github.com/nft-api/nft-api#getnftmetadata
	response, err := request.APIRequest(`/nft/` + address + `/metadata?chain=` + chain)
	if err != nil {
		fmt.Println("Error - ", err)
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "%v", response)
}