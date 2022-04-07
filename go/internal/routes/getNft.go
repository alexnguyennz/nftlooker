package routes

import (
	"api/pkg/ipfsurl"
	"api/pkg/request"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// Example  eth/collection/0x18f36d3222324ddac1efd0a524aabfb9d77d8041/nft/2098
func GetNft(w http.ResponseWriter, r *http.Request) {

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]
	tokenId := vars["tokenId"]

	// /nft/${address}/${tokenId}?chain=${chain}&format=decimal`,
	response, err := request.APIRequest(`/nft/` + address + `/` + tokenId + `?chain=` + chain)

	if err != nil {
		return
	}

	//fmt.Fprintf(w, "%v\n\n", response)

	type Response struct {
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

	var result Response

	err = json.Unmarshal([]byte(response), &result)

	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	//fmt.Fprintf(w, "Unmarshal: %v\n\n", result)

	// Fetch Metadata
	response, err = request.Request(result.Token_Uri)

	if err != nil {
		fmt.Println("Error -", err)
		return
	}

	//fmt.Fprintf(w, "Metadata: %v\n\n", response)

	var metadata map[string]interface{}
	

	err = json.Unmarshal([]byte(response), &metadata)

	if err != nil {
		fmt.Println("Couldn't unmarshal", err)
	}

	//fmt.Fprintf(w, "Metadata: %v\n\n", metadata)

	// changeIpfsUrl
	if metadata != nil {

		// some NFTs use image_url, set it to image
		if metadata["image_url"] != nil {
			metadata["image"] = metadata["image_url"]
		}

		if metadata["image"] != nil {

			// change URL if it uses IPFS protocol
			metadata["image"] = ipfsurl.ChangeIpfsUrl(metadata["image"].(string))

			// Format into JSON
			metadataJson, _ := json.Marshal(metadata)
			data := string(metadataJson)

			dataBytes := []byte(data) // convert back to send updated metadata with rest of response

			// custom struct to send updated marshalled metadata with rest of original response
			resultJson, err := json.Marshal(struct {
				Response
				Metadata json.RawMessage `json:"metadata"`
			}{
				Response: result,
				Metadata: dataBytes,
			})
			if err != nil {
				panic(err)
			}

			send := string(resultJson)

			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, "%v", send)

		}
	}

	// if attributes isn't array, convert into array of objects - do this

}