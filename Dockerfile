FROM golang:latest as builder

RUN mkdir -p /app
COPY . /app/notes-web
WORKDIR /app/notes-web
RUN go build ./cmd/notes-web.go

# NB: I tried to use alpine here but I would get "exec /app/notes-web: no such file or directory" when attempting
# to run the exe. The same would be true when running the container directly & invoking it, despite the fact that
# the file was discoverable by ls. Not sure why but that doesn't happen on ubuntu.
FROM ubuntu:latest

# Need to install ca-certificates explicitly to get the LetsEncrypt root cert
RUN apt update
RUN apt install ca-certificates -y
RUN mkdir -p /app
COPY --from=builder /app/notes-web/notes-web /app/notes-web
COPY --from=builder /app/notes-web/assets /app/assets

ENV NOTES_WEB_PORT 4444
ENV NOTES_WEB_STATIC_FILES_DIR /app/assets

ENTRYPOINT [ "/app/notes-web" ]