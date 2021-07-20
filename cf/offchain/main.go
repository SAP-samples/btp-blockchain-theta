package main

import (
    "fmt"
    "log"
    "net/http"
    "github.com/spf13/viper"
    geometry "github.com/andrewlunde/thetaoffchaingo"

)

func helloHandler(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/offchain/hello" {
        http.Error(w, "404 not found.", http.StatusNotFound)
        return
    }

    if r.Method != "GET" {
        http.Error(w, "Method is not supported.", http.StatusNotFound)
        return
    }


    fmt.Fprintf(w, "Hello!")
}

func linksHandler(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path != "/offchain/links" {
        http.Error(w, "404 not found.", http.StatusNotFound)
        return
    }

    if r.Method != "GET" {
        http.Error(w, "Method is not supported.", http.StatusNotFound)
        return
    }


    // data := []byte("V1 of student's called")
    w.Header().Set("Content-Type", "text/html")
    w.WriteHeader(200)
    fmt.Fprintf(w, "<a href=\"/offchain/links\">links</a><br />\n")
    fmt.Fprintf(w, "<a href=\"/offchain/hello\">hello</a><br />\n")
    fmt.Fprintf(w, "<a href=\"/index.html\">index</a><br />\n")
    fmt.Fprintf(w, "<a href=\"/form.html\">form</a><br />\n")
    // w.Write(data)
}

func formHandler(w http.ResponseWriter, r *http.Request) {
    if err := r.ParseForm(); err != nil {
        fmt.Fprintf(w, "ParseForm() err: %v", err)
        return
    }
    fmt.Fprintf(w, "POST request successful")
    name := r.FormValue("name")
    address := r.FormValue("address")

    fmt.Fprintf(w, "Name = %s\n", name)
    fmt.Fprintf(w, "Address = %s\n", address)
}

func main() {

	ellipse := geometry.Ellipse{
		9, 2,
	}
	fmt.Println(ellipse.GetEccentricity())

    fileServer := http.FileServer(http.Dir("./static")) 
    http.Handle("/", fileServer) 

    http.HandleFunc("/offchain/hello", helloHandler)

    http.HandleFunc("/offchain/links", linksHandler)

    http.HandleFunc("/offchain/form", formHandler)

    viper.SetDefault("port", "8080")
    viper.AutomaticEnv()
    port := viper.GetString("port")
    fmt.Printf("Starting server at port %s\n", port)
    if err := http.ListenAndServe(":" + port, nil); err != nil {
        log.Fatal(err)
    }
}

