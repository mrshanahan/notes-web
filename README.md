# note-web

Web interface & corresponding service to interface with a custom notes application. See the [notes-api](https://github.com/mrshanahan/notes-api) repository for more information.

## Building

Entirely Go-based; main entrypoint is in [`cmd/notes-web.go`](./cmd/notes-web.go). Just `go build` that target:

    $ go build ./cmd/notes-web.go

## Running locally

### via Docker Compose

A miniature stack has been setup in the [docker-compose.yml](./docker-compose.yml). There are a few requirements for this:

1. Build the [notes-api](https://github.com/mrshanahan/notes-api) container image by running `make build-image` in that repository.
2. Add the following entry to your local `hosts` file:

       127.0.0.1 notes-auth.local

   This will allow normal OAuth2 flows to work with the stack using a local version of the notes auth service.

You must either build the images separately or use the `--build` flag with startup:

    $ docker compose build
    $ docker compose up

    # OR

    $ docker compose up --build

### via `go run`

Directly running the web service will also work, although the serviced web pages will still need an API to talk to:

    $ go run ./cmd/notes-web.go
    2023/10/14 17:14:13 INFO no valid port provided via NOTES_WEB_PORT, using default portStr="" defaultPort=4444
    2023/10/14 17:14:13 INFO listening for requests port=4444

You can provide a different port using the `NOTES_WEB_PORT` environment variable:

    $ NOTES_WEB_PORT=1111 go run ./cmd/notes-web.go 
    2023/10/14 17:14:39 INFO using custom port port=1111
    2023/10/14 17:14:39 INFO listening for requests port=1111

You can also change the directory where static files are served from via `STATIC_FILES_DIR` (by default it will serve files from `./assets`):

    $ STATIC_FILES_DIR=~/repos/notes-web/assets go run ./cmd/notes-web.go

## Testing

:eyes:

## Structure

Repository structure follows standard Golang conventions; see: https://github.com/golang-standards/project-layout

## Owner

Matt Shanahan (mrshanahan11235@gmail.com)

License info [here](./LICENSE).
