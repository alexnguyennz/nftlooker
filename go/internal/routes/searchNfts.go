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

func SearchNfts(w http.ResponseWriter, r *http.Request) {

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
	
	type Data struct {
		Result []Result `json:"result"`
	}

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	q := vars["q"]
	filter := vars["filter"]
	limit := vars["limit"]
	offset := vars["offset"]

	response, err := request.APIRequest(`/nft/search?chain=` + chain + `&q=` + q + `&filter=` + filter + `&limit=` + limit + `&offset=` + offset)
	if err != nil {
		fmt.Println("Error - ", err)
	}

	var data Data

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

			response, err := request.Request(nft.Token_Uri)
			if err != nil {
				fmt.Println("Error -", err)
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

					metadata["original_image"] = metadata["image"] // set original image to use as backup

					// Format into JSON
					jsonByte, _ := json.Marshal(metadata)
					json := string(jsonByte)

					data.Result[i].Metadata = json // update original response
				}
			}

		}(i, nft) // End goroutine
	} // End for range loop

	wg.Wait() // Block execution until all goroutines are done

	// Format into JSON
	jsonByte, _ := json.Marshal(data.Result)
	json := string(jsonByte)

	// Send HTTP Response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "%v", json) 
}