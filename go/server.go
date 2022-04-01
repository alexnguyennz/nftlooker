package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {

	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello")
	})

	fmt.Printf("Starting server at port 7777\n")

	// handler is typically nil so DefaultServeMux is used
	if err := http.ListenAndServe(":7777", nil); err != nil {
		log.Fatal(err)
	}
}