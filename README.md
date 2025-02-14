# note-web

Web interface & corresponding service to interface with a custom notes application. See the [notes-api](https://github.com/mrshanahan/notes-api) repository for more information.

## Building

Entirely Go-based; main entrypoint is in [`cmd/notes-web.go`](./cmd/notes-web.go).

Just `go run` that file to run the whole shebang:

    $ go run ./cmd/notes-web.go
    2023/10/14 17:14:13 INFO no valid port provided via NOTES_WEB_PORT, using default portStr="" defaultPort=4444
    2023/10/14 17:14:13 INFO listening for requests port=4444

You can provide a different port using the `NOTES_WEB_PORT` environment variable:

    $ NOTES_WEB_PORT=1111 go run ./cmd/notes-web.go 
    2023/10/14 17:14:39 INFO using custom port port=1111
    2023/10/14 17:14:39 INFO listening for requests port=1111

You can also change the directory where static files are served from via `STATIC_FILES_DIR` (by default it will serve files from `./assets`):

    $ STATIC_FILES_DIR=~/repos/notes-web/assets go run ./cmd/notes-web.go

And obviously you can `go build` the same file to get the bin.

## Testing

:eyes:

## Structure

Repository structure follows standard Golang conventions; see: https://github.com/golang-standards/project-layout

## Owner

Matt Shanahan (mrshanahan11235@gmail.com)

License info [here](./LICENSE).
