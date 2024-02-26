# LAB 4: FROM Scratch

You've seen in previous labs we've always customised a base image using `FROM`.

For example, `node` itself has a `FROM` pointed to Linux.

You may have wondered, how far back does it go? What does Linux `FROM`?

The answer is `scratch` which you can think of as 'nothing'.

## The Go App

We've added a small webserver using `main.go`. You can run it using your terminal: `./webserver`.

Let's make a new `Dockerfile` file:

```dockerfile
# Build stage
FROM golang:alpine AS builder
WORKDIR /build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o webserver .

# Create final container
FROM scratch
COPY --from=builder /build/webserver /
EXPOSE 8080
CMD ["/webserver"]
```

Next lets build it:

```bash
docker build -t my-scratch-app .
```

Finally we can run it:

```bash
docker run -d -p 8080:8080 my-scratch-app
```

## From Scratch

`FROM scratch` is important as it hugely reduces the surface of the image:

```bash
REPOSITORY       TAG         IMAGE ID       CREATED             SIZE
my-scratch-app   latest      4a97cc554e16   4 minutes ago       10.6MB
```

Which in turn has two large advantages:

- Fast to deploy in Cloud environments (where you pay per second and for storage).
- Easy to audit for security - what you see if what you get.

There are some disadvantages for example there is no `bash` for example so you won't be able to use `docker exec -it <CONTAINER ID> /bin/bash` to attach to the container.

In such cases you can attach to `sh` instead:

```bash
docker exec -it my-scratch-app sh
```
