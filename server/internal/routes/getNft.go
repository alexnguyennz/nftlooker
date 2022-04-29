package routes

import (
	"api/pkg/ipfsurl"
	"api/pkg/request"
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

func GetNft(w http.ResponseWriter, r *http.Request) {

	type Data struct {
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

	var data Data

	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	// Fetch Metadata

	/* if data.Token_Uri != "" {
		if !strings.HasPrefix(data.Token_Uri, "data:application/json") {

		} else {

			base64 := strings.TrimPrefix(data.Token_Uri, "data:application/json;base64,")
			base64Decoded, _ := b64.StdEncoding.DecodeString(base64)

			//fmt.Println("base64", base64)

			//fmt.Println("base64 decode", string(base64Decoded))

			if json.Valid(base64Decoded) { // make sure JSON is actually valid even if base64 is correct
				//fmt.Println("base64 Test again", base64)
				metadata = ipfsurl.ParseMetadata(base64Decoded)
			}
		}

	} else {
		fmt.Println("No metadata.")
		return
	} */

	jsonData := ""

	if data.Metadata != "" {
		jsonData = ipfsurl.ParseMetadata([]byte(data.Metadata))
	} else {
		if data.Token_Uri != "" {
			if !strings.HasPrefix(data.Token_Uri, "data:application/json") {
				response, err := request.Request(data.Token_Uri)
				if err != nil {
					fmt.Println("Error fetching NFT Token URI", err)
					return
				}

				jsonData = ipfsurl.ParseMetadata([]byte(response))

			} else {
				base64 := strings.TrimPrefix(data.Token_Uri, "data:application/json;base64,")
				base64Decoded, _ := b64.StdEncoding.DecodeString(base64)

				if json.Valid(base64Decoded) { // make sure JSON is valid
					jsonData = ipfsurl.ParseMetadata(base64Decoded)
				}
			}
		}
	}

	var metadata map[string]interface{}

	err = json.Unmarshal([]byte(response), &metadata)
	if err != nil {
		fmt.Println("Couldn't unmarshal", err)
	}

	// changeIpfsUrl
	dataBytes := []byte(jsonData) // convert back to send updated metadata with rest of response

	// custom struct to send updated marshalled metadata with rest of original response
	jsonByte, err := json.Marshal(struct {
		Data
		Metadata json.RawMessage `json:"metadata"`
	}{
		Data:     data,
		Metadata: dataBytes,
	})
	if err != nil {
		panic(err)
	}

	// some NFTs don't use array for attributes, convert object into array of objects
	attributes, _ := json.Marshal(metadata["attributes"])
	// fmt.Fprintf(w, "len %v\n\n", len(attributes))

	switch last := len(attributes) - 1; {
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

	w.WriteHeader(http.StatusOK)
	w.Write(jsonByte)

}
