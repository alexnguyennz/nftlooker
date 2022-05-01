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

	type Block struct {
		Date string `json:"date"`
		Block int `json:"block"`
		Timestamp int `json:"timestamp"`
	}
	
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
	
	type Data struct {
		Result []Result `json:"result"`
		Total int `json:"total"`
	}

	// Get current timestamp to get latest block and convert to string
	now := time.Now().UnixMilli()
	timestamp := strconv.FormatInt(now, 10)

	// Moralis getDateToBlock https://docs.moralis.io/moralis-dapp/web3-sdk/native#getdatetoblock
	response, err := request.APIRequest(`/dateToBlock?chain=eth&date=` + timestamp)
	if err != nil {
		fmt.Println("API Request Error", err)
		return
	}

	var block Block

	err = json.Unmarshal([]byte(response), &block)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	latestBlock := strconv.Itoa(block.Block) 


	// Moralis GetNFTTransfersByBlock https://github.com/nft-api/nft-api#GetNFTTransfersByBlock
	response, err = request.APIRequest(`/block/` + latestBlock + `/nft/transfers?chain=eth&limit=250`)
	if err != nil {
		fmt.Println("API Request Error", err)
		return
	}

	var data Data

	err = json.Unmarshal([]byte(response), &data)
	if err != nil {
		fmt.Println("Couldn't unmarshal: ", err)
		return
	}

	if data.Total > 0 {
		rand := rand.Intn(data.Total) // generate random number from 1 to no. of transfers

		w.WriteHeader(http.StatusOK)

		if len(data.Result[rand].To_Address) != 0 {
			if data.Result[rand].To_Address != "" && data.Result[rand].To_Address != "0x0000000000000000000000000000000000000000" && data.Result[rand].To_Address != "0x000000000000000000000000000000000000dead" {
				fmt.Fprintf(w, "%s", data.Result[rand].To_Address)
			}
		} else if len(data.Result[rand].From_Address) != 0 {
			if data.Result[rand].From_Address != "" && data.Result[rand].From_Address != "0x0000000000000000000000000000000000000000" && data.Result[rand].From_Address != "0x000000000000000000000000000000000000dead" {
				fmt.Fprintf(w, "%s", data.Result[rand].From_Address)
			}
		}
	}
}