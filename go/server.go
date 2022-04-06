package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync" // return errors to the caller

	"os"

	"github.com/gorilla/mux" // Router
	"github.com/joho/godotenv"
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

func getWalletNfts(w http.ResponseWriter, r *http.Request) {

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]


	/*** REQUEST ***/
	/***************/
	
	// Moralis GetNFTs https://github.com/nft-api/nft-api#getnfts
	req, err := http.NewRequest("GET", os.Getenv("MORALIS_API_URL") + address + "/nft?chain=" + chain, nil)
	if err != nil {
		log.Fatal(err)
	}

	// Set Headers
	req.Header = http.Header{
		"accept": []string{"application/json"},
		"x-api-key": []string{os.Getenv("MORALIS_API_KEY")},
	}

	// Make Request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	// Format Body
	defer resp.Body.Close()
	resBody, _ := ioutil.ReadAll(resp.Body)
	response := string(resBody)

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

			response, err := Request(nft.Token_Uri)

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

					// parse image URL
					u, _ := url.Parse(metadata["image"].(string))

					if strings.HasPrefix(metadata["image"].(string), "ipfs://ipfs/") {

						u.Scheme = "https"
						u.Path = "/ipfs" + u.Path // prepend /ipfs/ path to CID
						u.Host = "ipfs.io"
						
					} else if strings.HasPrefix(metadata["image"].(string), "ipfs://") {
		
						u.Scheme = "https"
						u.Path = "/ipfs/" + u.Host // prepend /ipfs/ path to CID
						u.Host = "ipfs.io"
		
					} else if strings.HasPrefix(metadata["image"].(string), "https://gateway.pinata.cloud/") {
						u.Host = "ipfs.io"
					} else { // Testing
						u.Host = "TESTINGCHANGETHIS.IO"
					} 

					metadata["image"] = u.String() // update transformed image URL
		
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
	fmt.Fprintf(w, "%v", data) // Send Data Response 

}

func Request(url string) (string, error) {
	
	resp, err := http.Get(url)
	if err != nil {
		return "", errors.New("response error from Get() of " + url)
	}

	// close once body is returned
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", errors.New("couldn't read body")
	}

	data := string(body)

	return data, nil
}


func main() {

	r := mux.NewRouter() // gorilla/mux router

	// LOAD ENV VARIABLES
	err := godotenv.Load()
	if err != nil { log.Fatal("Error loading .env file") }
	
	/***** ROUTES *****/
	/******************/

	r.HandleFunc("/nfts/chain/{chain}/address/{address}", getWalletNfts)

	/*** END ROUTES ***/
	/******************/

	log.Fatal(http.ListenAndServe("localhost:" + os.Getenv("GO_PORT"), r))
}