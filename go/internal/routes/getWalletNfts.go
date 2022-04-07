package routes

import (
	"api/pkg/ipfsurl"
	"api/pkg/request"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
)

// TYPES
type Result struct {
	Token_Address string `json:"token_address"`
	Token_Id string `json:"token_id"`
	Block_Number_Minted string `json:"block_number_minted"`
	Owner_Of string `json:"owner_of"`
	Block_Number string `json:"block_number"`
	Amount string `json:"amount"`
	Contract_Type string `json:"contract_type"`
	Name string `json:"name"`
	Symbol string `json:"symbol"`
	Token_Uri string `json:"token_uri"`
	Metadata string `json:"metadata"`
	Synced_At string `json:"synced_at"`
	Is_Valid int `json:"is_valid"`
	Syncing int `json:"syncing"`
	Frozen int `json:"frozen"`
}

type Response struct {
	Result []Result `json:"result"`
}

func GetWalletNfts(w http.ResponseWriter, r *http.Request) {

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]

	/*** REQUEST ***/
	/***************/

	response, err := request.APIRequest(address + "/nft?chain=" + chain)

	/*** END REQUEST ***/
	/*******************/

	// Declare Response typed result
	var result Response

	err = json.Unmarshal([]byte(response), &result)

	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	var wg sync.WaitGroup // Create WaitGroup to wait for all goroutines to finish

	// Loop through each NFT's results
	for i, nft := range result.Result {

		wg.Add(1)

		// Fetch each NFT's metadata in parallel
		go func(i int, nft Result) {

			// Decrease WaitGroup when goroutine has finished
			defer wg.Done()

			response, err := request.Request(nft.Token_Uri)

			if err != nil {
				fmt.Println("Error -", err)
				//w.WriteHeader(http.StatusInternalServerError)
				return
			}

			var metadata map[string]interface{}

			err = json.Unmarshal([]byte(response), &metadata)

			if err != nil {
				fmt.Println("Couldn't unmarshal", err)
			}

			// changeIpfsUrl
			if metadata != nil {

				// some NFTs use image_url, set it back to image
				if metadata["image_url"] != nil {
					metadata["image"] = metadata["image_url"]
				}

				if metadata["image"] != nil {

					// change URL if it uses IPFS protocol
					metadata["image"] = ipfsurl.ChangeIpfsUrl(metadata["image"].(string))

					// Format into JSON
					metadataJson, _ := json.Marshal(metadata)
					data := string(metadataJson)

					result.Result[i].Metadata = data // update original response
				}
			}

		}(i, nft) // End goroutine
	} // End for range loop

	// Block execution until all goroutines are done
	wg.Wait()

	// Group NFTs by collection address
	grouped := make(map[string][]Result)

	for _, collection := range result.Result {
		grouped[collection.Token_Address] = append(grouped[collection.Token_Address], collection)
	}

	// Format into JSON
	groupedJson, _ := json.Marshal(grouped)
	data := string(groupedJson)

	// Send HTTP Response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "%v", data) 

}