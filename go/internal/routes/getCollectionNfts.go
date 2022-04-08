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

func GetCollectionNfts(w http.ResponseWriter, r *http.Request) {

	type Result struct {
		Token_Address string `json:"token_address"`
		Token_Id string `json:"token_id"`
		Contract_Type string `json:"contract_type"`
		Token_Uri string `json:"token_uri"`
		Metadata string `json:"metadata"`
		Synced_At string `json:"synced_at"`
		Amount string `json:"amount"`
		Name string `json:"name"`
		Symbol string `json:"symbol"`
	}

	type Data struct {
		Result []Result `json:"result"`
	}

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]
	limit := vars["limit"]
	offset := vars["offset"]

	// Moralis GetAllTokenIds https://github.com/nft-api/nft-api#getalltokenids
	response, err := request.APIRequest(`/nft/` + address + `/?chain=` + chain + `&limit=` + limit + `&offset=` + offset)
	if err != nil {
		fmt.Println("Error - ", err)
	}

	var data Data

	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	var wg sync.WaitGroup

	for i, nft := range data.Result {

		wg.Add(1)

		// Fetch each NFT's metadata in parallel
		go func (i int, nft Result) {

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

					// Format into JSON
					jsonByte, _ := json.Marshal(metadata)
					json := string(jsonByte)

					data.Result[i].Metadata = json // update original response
				}
			}

		}(i, nft)

	}

	wg.Wait()

	// Format into JSON
	jsonByte, _ := json.Marshal(data.Result)
	json := string(jsonByte)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "%v", json)
}