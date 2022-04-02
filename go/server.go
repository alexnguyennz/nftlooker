package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"sync"

	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// `${process.env.MORALIS_API_URL}/${resolvedAddress}/nft?chain=${chain}&format=decimal`,
// https://deep-index.moralis.io/api/v2
// `/api/nfts?chain=${chain}&address=${params.walletAddress}`,
func getWalletNfts(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]

	//chain := r.URL.Query().Get("chain")

	

	w.WriteHeader(http.StatusOK)
  //fmt.Fprintf(w, "Chain: %v\n", chain)
  //fmt.Fprintf(w, "Address: %v\n", address)

	// resp, err := http.Get("https://deep-index.moralis.io/api/v2/" + address + "/nft?chain=" + chain)
	//fmt.Fprintf(w, "response", resp, err)

	req, err := http.NewRequest("GET", "https://deep-index.moralis.io/api/v2/" + address + "/nft?chain=" + chain, nil)
	if err != nil {
		log.Fatal(err)
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("X-API-KEY", "")

	// make request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	defer resp.Body.Close()
	resBody, _ := ioutil.ReadAll(resp.Body)
	response := string(resBody)
	// end request


	type Result struct {
		Token_Address string
		Token_Id string
		Block_Number_Minted string
		Owner_Of string
		Block_Number string
		Amount string
		Contract_Type string
		Name string
		Symbol string
		Token_Uri string
		Metadata string
		Synced_At string
		Is_Valid int
		Syncing int
		Frozen int
	}

	type Response struct {
		Result []Result
	}

	var result Response

	json.Unmarshal([]byte(response), &result)
	

	type Metadata struct {
		Image string
	}
	
	for _, nft := range result.Result {
		//fmt.Fprintf(w, "%s\n", nft.Token_Uri)

		var waitgroup sync.WaitGroup
		waitgroup.Add(1)

		// var metadata string

		var metadata Metadata

		go func() {
			response := Request(nft.Token_Uri)
			json.Unmarshal([]byte(response), &metadata)
			
			//fmt.Fprintf(w, "%s", metadata)
			waitgroup.Done() // decrease waitgroup once goroutine has finished
		} ()

		// block until waitgroup becomes 0 or all goroutines are done
		waitgroup.Wait()

		fmt.Fprintf(w, "%s", metadata.Image)

		// if metadata != "" {
		// 	fmt.Println("empty")
		// }

	}

}

func Request(token_uri string) string {
	//start := time.Now()
	resp, err := http.Get(token_uri)
	if err != nil {
		fmt.Println("Err is", err)
		return ""
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Err is", err)
		return ""
	}


	response := string(body)

	// fmt.Printf("%v", response)

	return response

}

// formatting
// checks for content type



func main() {
	r := mux.NewRouter()
    // Routes consist of a path and a handler function.
	r.HandleFunc("/nfts/chain/{chain}/address/{address}", getWalletNfts).Methods("GET")

	log.Fatal(http.ListenAndServe("localhost:9999", r))
}




// default
/* func main() {

	http.HandleFunc("/hello", helloHandler)

	fmt.Printf("Starting server at port 7777\n")

	// handler is typically nil so DefaultServeMux is used
	//if err := http.ListenAndServe(":7777", nil); err != nil {
	if err := http.ListenAndServe("127.0.0.1:7777", nil); err != nil {
		log.Fatal(err)
	}
} */