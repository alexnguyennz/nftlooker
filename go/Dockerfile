FROM golang:1.18

RUN mkdir /build

ADD . /build

ADD go.mod go.sum .env /cmd /internal /pkg /build/

WORKDIR /build

RUN go build