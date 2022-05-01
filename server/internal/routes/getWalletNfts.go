package routes

import (
	"api/pkg/ipfsurl"
	"api/pkg/request"
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"

	"github.com/gorilla/mux"
)

func GetWalletNfts(w http.ResponseWriter, r *http.Request) {

	type Result struct {
		Token_Address       string `json:"token_address"`
		Token_Id            string `json:"token_id"`
		Block_Number_Minted string `json:"block_number_minted"`
		Owner_Of            string `json:"owner_of"`
		Block_Number        string `json:"block_number"`
		Amount              string `json:"amount"`
		Contract_Type       string `json:"contract_type"`
		Name                string `json:"name"`
		Symbol              string `json:"symbol"`
		Token_Uri           string `json:"token_uri"`
		Metadata            string `json:"metadata"`
		Synced_At           string `json:"synced_at"`
		Is_Valid            int    `json:"is_valid"`
		Syncing             int    `json:"syncing"`
		Frozen              int    `json:"frozen"`
	}

	type Response struct {
		Status    string              `json:"status"`
		Total     int                 `json:"total"`
		Page      int                 `json:"page"`
		Page_Size int                 `json:"page_size"`
		Cursor    string              `json:"cursor,omitempty"`
		Result    []Result            `json:"result"`
		Data      map[string][]Result `json:"data"`
	}

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]
	limit := vars["limit"]
	cursor := vars["cursor"]

	// Moralis GetNfts https://github.com/nft-api/nft-api#getnfts
	if cursor != "" {
		cursor = "&cursor=" + cursor
	}

	response, err := request.APIRequest(address + "/nft?chain=" + chain + "&limit=" + limit + cursor)
	if err != nil {
		fmt.Println("Error - ", err)
	}

	//fmt.Println("response", response)

	var data Response

	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	var wg sync.WaitGroup // Create WaitGroup to wait for all goroutines to finish

	// Loop through each NFT's results
	for i, nft := range data.Result {

		wg.Add(1)

		// Fetch each NFT's metadata in parallel
		go func(i int, nft Result) {

			// Decrease WaitGroup when goroutine has finished
			defer wg.Done()

			if nft.Metadata != "" {
				data.Result[i].Metadata = ipfsurl.ParseMetadata([]byte(nft.Metadata))
			} else {
				/* response, err := request.APIRequest("nft/" + nft.Token_Address + "/" + nft.Token_Id + "/metadata/resync?chain=" + chain + "&flag=metadata&mode=async") // Resync metadata to make future calls for the same NFT data faster
				fmt.Println("Resync Status:", response) */

				// token_uri must exist and be fetchable
				if nft.Token_Uri != "" {
					if !strings.HasPrefix(nft.Token_Uri, "data:application/json") {
						response, err := request.Request(nft.Token_Uri)
						if err != nil {
							fmt.Println("Error fetching NFT Token URI", err)
							return
						}

						data.Result[i].Metadata = ipfsurl.ParseMetadata([]byte(response))

					} else {

						base64 := strings.TrimPrefix(nft.Token_Uri, "data:application/json;base64,")
						base64Decoded, _ := b64.StdEncoding.DecodeString(base64)

						if json.Valid(base64Decoded) {
							data.Result[i].Metadata = ipfsurl.ParseMetadata(base64Decoded)
						}
					}

				} else {
					fmt.Println("No metadata.")
					return
				}
			}

		}(i, nft) // End goroutine
	} // End for range loop

	wg.Wait() // Block execution until all goroutines are done

	// Group NFTs by collection address
	grouped := make(map[string][]Result)
	for i, collection := range data.Result {

		// if metadata is empty, don't add to final result
		if data.Result[i].Metadata != "" {
			grouped[collection.Token_Address] = append(grouped[collection.Token_Address], collection)
		}
	}

	data.Data = grouped // add grouped collections to Data field
	jsonByte, _ := json.Marshal(data)

	// Send HTTP Response
	w.WriteHeader(http.StatusOK)
	w.Write(jsonByte)
}
