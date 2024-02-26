# LAB 2: Improving the container

Let's start by making sure we have the latest image.

```bash
docker build -t my-node-app .
```

Next lets inspect the image size:

```bash
docker images
```

Heres the output:

```bash
REPOSITORY       TAG               IMAGE ID       CREATED         SIZE
my-node-app      latest            96b87dc8e7d2   5 seconds ago   1.77GB
```

## Issues

There's a few things we don't like about this;

- Our container is much larger than it needs to be:
  - We ship all `node_modules` including the developer / local only files.
  - We're using full fat Linux rather than a Docker optimised image.
- The runtime user is running as the default `root` user, we should use a non-root user!

Lets solve these issues.

## Making the container smaller

### Using slim images

The first thing to tackle is the Linux size. [Docker Node](https://hub.docker.com/_/node/tags) come's in a variety of types and sizes.

NodeJS recommend `-slim` for smaller images by removing unused libraries from the underlying OS.

Update your `Dockerfile` in `lab-2` with::

```dockerfile
FROM node:20
```

to

```dockerfile
FROM node:20-slim
```

to shave 1.5GB off our image!

Build your image.

```bash
docker build -t my-node-app .
```

Next lets inspect the image size again:

```bash
docker images
```

Heres the new output:

```bash
REPOSITORY       TAG               IMAGE ID       CREATED         SIZE
my-node-app      latest            51a1fb2ed39c   4 seconds ago   517MB
```

> You can also try `-alpine` which further decreases the size. Note that alpine is extremely aggressive and so may cause issues if image is too cut down.

For the curious, you can see the Docker Linus file [here](https://github.com/nodejs/docker-node/blob/main/20/alpine3.19/Dockerfile). It's Docker all the way down...

### Splitting the build and runtime

As the developer dependencies are only required for the build step, we can also split the build and runtime steps into two separate build steps.

The first image should run `npm i && npm run build` to create the JavaScript.

Then a second image can be just the JavaScript + Runtime dependencies.

Replace your `Dockerfile` in `lab-2` with:

```dockerfile
# --- Build stage ---
FROM node:20-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# --- Runtime stage ---
FROM node:20-slim AS runtime

# Set the working directory in the container
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder ./app/dist ./dist
COPY package*.json ./

# Run install again but only for runtime dependencies.
RUN npm install --production

# Open the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
```

This will create two docker step;

- First (the builder) to build the node application i.e. turn TS into JS for runtime.
- Second (the run time) to take the output from the previous step and run nodejs index.js.

### Improve security

Current the runtime process is running as root within the container.

We should create a new user and give it only permissions to the runtime folder.

```bash
# --- Build stage ---
FROM node:20-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# --- Runtime stage ---
FROM node:20-slim AS runtime

# Set the working directory in the container
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder ./app/dist ./dist
COPY package*.json ./

# Run install again but only for runtime dependencies.
RUN npm install --production

# Create a new user "appuser" with permissions over /app folder.
RUN groupadd --gid 2000 appuser \
    && useradd --uid 2000 --gid 2000 -m appuser \
    && chown -R 2000:2000 /home/appuser \
    && chown -R 2000:2000 /app

# Change to the appuser
USER appuser

# Open the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["npm", "start"]
```

Once more, lets build your image.

```bash
docker build -t my-node-app .
```

Next lets inspect the image size again:

```bash
docker images
```

Heres the new output:

```bash
REPOSITORY       TAG               IMAGE ID       CREATED          SIZE
my-node-app      latest            93b8bb0c5a6d   20 seconds ago   330MB
```

### Run your new image

Lets run the image and make sure all is still well.

```bash
docker run -d -p 8080:8080 my-node-app
```

Visit `http://localhost:8080`.

### Clean Up

See all running images

```bash
docker ps
```

Stop the image

```bash
docker stop <CONTAINER_ID_GOES_HERE> # Add your container image. For example 'docker stop 43acd01c7d1c'
```
