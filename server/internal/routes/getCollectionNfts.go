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

func GetCollectionNfts(w http.ResponseWriter, r *http.Request) {

	type Result struct {
		Token_Address string `json:"token_address"`
		Token_Id      string `json:"token_id"`
		Contract_Type string `json:"contract_type"`
		Token_Uri     string `json:"token_uri"`
		Metadata      string `json:"metadata"`
		Synced_At     string `json:"synced_at"`
		Amount        string `json:"amount"`
		Name          string `json:"name"`
		Symbol        string `json:"symbol"`
	}

	type Response struct {
		Total     int      `json:"total"`
		Page      int      `json:"page"`
		Page_Size int      `json:"page_size"`
		Cursor    string   `json:"cursor,omitempty"`
		Result    []Result `json:"result"`
		Data      []Result `json:"data"`
	}

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]
	limit := vars["limit"]
	cursor := vars["cursor"]

	if cursor != "" {
		cursor = "&cursor=" + cursor
	}

	// Moralis GetAllTokenIds https://github.com/nft-api/nft-api#getalltokenids
	response, err := request.APIRequest(`/nft/` + address + `/?chain=` + chain + `&limit=` + limit + cursor)
	if err != nil {
		fmt.Println("Error - ", err)
	}

	var data Response

	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	var wg sync.WaitGroup

	for i, nft := range data.Result {

		wg.Add(1)

		// Fetch each NFT's metadata in parallel
		go func(i int, nft Result) {

			// Decrease WaitGroup when goroutine has finished
			defer wg.Done()

			

			if nft.Metadata != "" {
				
				data.Result[i].Metadata = ipfsurl.ParseMetadata([]byte(nft.Metadata))
			} else {
				// token_uri must exist and be fetchable
				if nft.Token_Uri != "" {
					if !strings.HasPrefix(nft.Token_Uri, "data:application/json") {
						response, err := request.Request(nft.Token_Uri)
						if err != nil {
							fmt.Println("Error fetching token_uri", err)

							data.Result[i].Metadata = "{}"
							return
						}
						// invalid character s issue happens here
						fmt.Println("metadata ", nft.Metadata)
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
				}
			}

		}(i, nft)

	}

	wg.Wait()

	data.Data = data.Result

	// Format into JSON
	jsonByte, _ := json.Marshal(data)

	// Send HTTP Response
	w.WriteHeader(http.StatusOK)
	w.Write(jsonByte)
}
