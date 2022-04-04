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

	err = json.Unmarshal([]byte(response), &result)

	if err != nil {
		fmt.Println("Couldn't unmarshal result", err)
		
	}
	
	// LOOP
	// data := &Data{ManyItems: make([]Item, len(resp))}
	//list := &Response{Result: make([]Result, len(resBody))}
	//list := make([]Result, len(resp))

	//fmt.Fprintf(w, "List: %v", list)

	//fmt.Fprintf(w, "%v\n\n", result)

	fmt.Fprintf(w, "Unmarshalled: \n%v\n\n", response)

	fmt.Fprintf(w, "Original Metadata: \n%v\n\n", result)

	updatedResult := result
	
	//fmt.Fprintf(w, "test %v", updatedResult.Result[0].Metadata)

	for i, nft := range result.Result {
		//fmt.Fprintf(w, "%s\n", nft.Token_Uri)

		//fmt.Fprintf(w, "Index: %v \n%v\n\n", i, nft)

		var waitgroup sync.WaitGroup
		waitgroup.Add(1)



		// var metadata string

		//var metadata Metadata
		var metadata map[string]interface{}

		// fetch token_uri in parallel
		go func() {
			response, err := Request(nft.Token_Uri)

			if err != nil {
				fmt.Println("Error -", err)
				//w.WriteHeader(http.StatusInternalServerError)
				// waitgroup.Done()
				// return
			}

			fmt.Fprintf(w, "Token Uri Response: \n%s\n\n", response)
			
			errs := json.Unmarshal([]byte(response), &metadata)

			if errs != nil {
				fmt.Println("error test")
			}
			
			//fmt.Fprintf(w, "%s", metadata)
			waitgroup.Done() // decrease waitgroup once goroutine has finished
		} ()

		// block until waitgroup becomes 0 or all goroutines are done
		waitgroup.Wait()

		//fmt.Println("test", )

		fmt.Println("Metadata", metadata)


		// changeIpfsUrl
		//if metadata["Image"] != "" {
		if metadata != nil {	
			
			if strings.HasPrefix(metadata["image"].(string), "ipfs://ipfs/") {

				u, _ := url.Parse(metadata["image"].(string))
				u.Scheme = "https"
				u.Path = "/ipfs" + u.Path // prepend /ipfs/ path to CID
				u.Host = "ipfs.io"

				//metadata["Image"] = u.String()
				
			} else if strings.HasPrefix(metadata["image"].(string), "ipfs://") {

				u, _ := url.Parse(metadata["image"].(string))
				u.Scheme = "https"
				u.Path = "/ipfs/" + u.Host // prepend /ipfs/ path to CID
				u.Host = "ipfs.io"

				metadata["image"] = u.String()

			} else if strings.HasPrefix(metadata["image"].(string), "https://gateway.pinata.cloud/") {

				u, _ := url.Parse(metadata["image"].(string))
				u.Host = "ipfs.io"

				metadata["image"] = u.String()
				// TESTING
			} else {

				
				u, err := url.Parse(metadata["image"].(string))

				if err != nil {
					fmt.Println("test", err)
				}
				u.Host = "test.io"

				metadata["image"] = u.String()
			}

			// marshalled JSON data after updating the metadata
			//fmt.Fprintf(w, "Unmarshalled: %v\n\n", metadata)
			updatedData, _ := json.Marshal(metadata)

			// update existing metadata with new
			nft.Metadata = string(updatedData);

			//fmt.Fprintf(w, "Marshalled: %v\n\n", nft.Metadata)

			updatedResult.Result[i].Metadata = nft.Metadata
			
			// fmt.Fprintf(w, "%s\n\n", nft.Metadata)

		}

		
	}

	// updated
	fmt.Fprintf(w, "Updated Metadata:\n%v\n\n", updatedResult)

	// marshalled
	sendData, _ := json.Marshal(updatedResult.Result)

	marshalled := string(sendData)

	fmt.Fprintf(w, "Marshalled: %v", marshalled)


}

func Request(token_uri string) (string, error) {
	//start := time.Now()
	resp, err := http.Get(token_uri)
	if err != nil {
		fmt.Println("Response Error", err)
		return "", errors.New("couldn't fetch Token URI")
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Body Error", err)
		return "", errors.New("couldn't read body")
	}


	response := string(body)

	// fmt.Printf("%v", response)

	return response, nil

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


		/* get the image's Content-Type
		resp, _ := http.Head(metadata.Image)
		contentType := resp.Header.Get("Content-Type")
		fmt.Fprintf(w, "%s", contentType) */

		//fmt.Fprintf(w, "%s", metadata.Image)


					/*
				// ipfs://ipfs/
				u, _ := url.Parse("ipfs://ipfs/QmbkBdEkU9WX9fiZwjp4A3JuXrA5XazgdF29ioJcQJxzmz")
				u.Scheme = "https"
				u.Path = "/ipfs" + u.Path // prepend /ipfs/ path to CID
				u.Host = "ipfs.io"

				metadata.Image = u.String()

				fmt.Fprintf(w, "ipfs://ipfs %s\n", metadata.Image)

				// ipfs://
				u, _ = url.Parse("ipfs://QmbkBdEkU9WX9fiZwjp4A3JuXrA5XazgdF29ioJcQJxzmz")
				u.Scheme = "https"
				u.Path = "/ipfs/" + u.Host // prepend /ipfs/ path to CID
				u.Host = "ipfs.io"

				metadata.Image = u.String()

				fmt.Fprintf(w, "ipfs:// %s\n", metadata.Image)

				// https://gateway.pinata.cloud/
				u, _ = url.Parse("https://gateway.pinata.cloud/ipfs/QmbkBdEkU9WX9fiZwjp4A3JuXrA5XazgdF29ioJcQJxzmz")
				u.Host = "ipfs.io"

				metadata.Image = u.String()
				fmt.Fprintf(w, "https://gateway.pinata.cloud/ %s\n", metadata.Image) */

		