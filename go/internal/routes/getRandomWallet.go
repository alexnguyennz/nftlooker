package routes

import (
	"api/pkg/request"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

func GetRandomWallet(w http.ResponseWriter, r *http.Request) {

	now := time.Now().UnixMilli() // Get current timestamp in ms to get latest block
	timestamp := strconv.FormatInt(now, 10) // Convert from base-10 int64 to string


	// Moralis getDateToBlock https://docs.moralis.io/moralis-dapp/web3-sdk/native#getdatetoblock
	response, err := request.APIRequest(`/dateToBlock?chain=eth&date=` + timestamp)

	
	type Block struct {
		Date string `json:"date"`
		Block int `json:"block"`
		Timestamp int `json:"timestamp"`
	} 
	
	// fmt.Fprintf(w, "%v\n\n", response)

	var block Block

	err = json.Unmarshal([]byte(response), &block)

	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	block.Block = block.Block - 5 // subtract a few blocks, may be safer for more consistent results

	latestBlock := strconv.Itoa(block.Block)

	//fmt.Fprintf(w, "Unmarshal: %v\n\n", latestBlock)

	// Moralis GetNFTTransfersByBlock https://github.com/nft-api/nft-api#GetNFTTransfersByBlock
	response, err = request.APIRequest(`/block/` + latestBlock + `/nft/transfers?chain=eth&limit=250`)
	

	type Result struct {
		Block_Number string `json:"block_number"`
		Block_Timestamp string `json:"block_timestamp"`
		Block_Hash string `json:"block_hash"`
		Transaction_Hash string `json:"transaction_hash"`
		Transaction_Index int `json:"transaction_index"`
		Log_Index int `json:"log_index"`
		Value string `json:"value,omitempty"`
		Contract_Type string `json:"contract_type"`
		Transaction_Type string `json:"transaction_type"`
		Token_Address string `json:"token_address"`
		Token_Id string `json:"token_id"`
		From_Address string
		To_Address string `json:"to_address"`
	}

	type Response struct {
		Result []Result `json:"result"`
		Total int `json:"total"`
	}

	//fmt.Fprintf(w, "GetNFTTransfers: %v\n\n", response)

	var result Response

	err = json.Unmarshal([]byte(response), &result)

	// fmt.Fprintf(w, "Response: %v\n\n", response)

	if result.Total > 0 {
		rand := rand.Intn(result.Total) // generate random number from 1 to length of transfers

		// fmt.Fprintf(w, "Random object: %v\n\n", result.Result[rand].To_Address)

		if len(result.Result[rand].To_Address) != 0 {
			if result.Result[rand].To_Address != "" && result.Result[rand].To_Address != "0x0000000000000000000000000000000000000000" && result.Result[rand].To_Address != "0x000000000000000000000000000000000000dead" {
				w.WriteHeader(http.StatusOK)
				fmt.Fprintf(w, "%s", result.Result[rand].To_Address)
			}
		} else if len(result.Result[rand].From_Address) != 0 {
			if result.Result[rand].From_Address != "" && result.Result[rand].From_Address != "0x0000000000000000000000000000000000000000" && result.Result[rand].From_Address != "0x000000000000000000000000000000000000dead" {
				w.WriteHeader(http.StatusOK)
				fmt.Fprintf(w, "%s", result.Result[rand].From_Address)
			}
		}
	}
		 
	


}