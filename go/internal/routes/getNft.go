package routes

import (
	"api/pkg/ipfsurl"
	"api/pkg/request"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func GetNft(w http.ResponseWriter, r *http.Request) {

	type Data struct {
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

	type Attr struct {
		Type  string
		Value interface{}
	}
	
	type AttrList []Attr 

	// PARAMS
	vars := mux.Vars(r)
	chain := vars["chain"]
	address := vars["address"]
	tokenId := vars["tokenId"]

	response, err := request.APIRequest(`/nft/` + address + `/` + tokenId + `?chain=` + chain)
	if err != nil {
		return
	}

	var result Data

	err = json.Unmarshal([]byte(response), &result)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	// Fetch Metadata
	response, err = request.Request(result.Token_Uri)
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
			jsonByte, err := json.Marshal(struct {
				Data
				Metadata json.RawMessage `json:"metadata"`
			}{
				Data: result,
				Metadata: dataBytes,
			})
			if err != nil {
				panic(err)
			}

			// some NFTs don't use array for attributes, convert object into array of objects
			attributes, _ := json.Marshal(metadata["attributes"])
			// fmt.Fprintf(w, "len %v\n\n", len(attributes))

			switch last := len(attributes)-1; {
				// is array
				//case attributes[0] == '[' && attributes[last] == ']': // do nothing
					
				// is object
				case attributes[0] == '{' && attributes[last] == '}':
					var obj map[string]interface{}
					json.Unmarshal(attributes, &obj)

					var ls *AttrList // * attached to a type (*string) indicates a pointer to the type

					for key, value := range obj {
						// * attached to a variable in an assignment (*v = ...) indicates an indirect assignment. That is, change the value pointed at by the variable.
             *ls = append(*ls, Attr{Type: key, Value: value})
        	}

					fmt.Fprintf(w, "%v", ls)
					return 
			}

			json := string(jsonByte)

			w.WriteHeader(http.StatusOK)
			fmt.Fprintf(w, "%v", json)
		}
	}
}