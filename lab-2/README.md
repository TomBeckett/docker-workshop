# LAB 2: Improving the container

Unfortunately the developers have re-written the application in TypeScript. This means the application needs to be **transpiled** before deployment.

The steps developers use locally are:

```bash
npm i # Install dependencies
npm run build # Build the application
npm start # Run the application
```

You can run this locally and try it out!

## Issues

There's a few things we don't like about this;

- Our container is much larger than it needs to be.
- We ship all `node_modules` including the developer / local only files.
- The runtime user is running as the default `root` user, we should use a non-root user!

Lets solve these issues:

## Making the container smaller

### Using slim images

The first thing to tackle is the image size. [Docker Node](https://hub.docker.com/_/node/tags) comes in a variety of types and sizes.

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

> You can also try `-alpine` which further decreases the size. Note that alpine is extremely aggressive and so may cause issues if image is too cut down.

### Splitting the build and runtime

As the developer dependencies are only required for the build step, we can also split the build and runtime steps into two separate images.

The first image should run `npm i && npm run build` to create the JavaScript.

Then a second image can be just the JavaScript + Runtime dependencies.

Replace your `Dockerfile` in `lab-2` with:

```dockerfile
# --- Build stage ---
# Start the first stage of the build process, using a Node.js 20 slim image as the base.
# This stage is named "builder" and is used to compile/build the application.
FROM node:20-slim AS builder

# Create a new directory to hold the application code inside the image, and set it as the working directory.
WORKDIR /app

# Node.js image comes with a non-root user 'node' by default, but we do not switch to it yet as we need
# permissions to install global packages and perform other root-level operations during the build.

# Copy the package.json and package-lock.json (if available) to the container.
COPY package*.json ./

# Install all dependencies defined in package.json.
RUN npm install

# Copy the entire project into the container.
COPY . .

# Run the build script defined in package.json to compile the application.
RUN npm run build

# --- Production stage ---
# Start the second stage of the build process, using the same Node.js 20 slim image.
FROM node:20-slim

# Create and set the working directory inside the image.
WORKDIR /app

# Switch to the non-root user 'node' provided by the default Node.js image.
# This enhances the security of the running container.
USER node

# Copy only the package.json and package-lock.json from the builder stage.
COPY --from=builder /app/package*.json ./

# Since we are now operating as a non-root user, we need to ensure that npm install
# can run successfully without requiring root permissions.
# The NODE_ENV environment variable could be set to production to skip devDependencies, but
# --only=production is used explicitly here for clarity.
RUN npm install --only=production

# Copy the compiled application from the builder stage to the production image.
# The 'node' user has permission to write to its home directory, so no permission issues here.
COPY --from=builder /app/dist ./dist

# Inform Docker that the container listens on port 8080 at runtime.
EXPOSE 8080

# Use the non-root 'node' user to run the application.
CMD ["npm", "start"]
```

This will create two docker images;

- First (the builder) to build the node application i.e. turn TS into JS for runtime.
- Second (the run time) to take the output from the previous image and run nodejs index.js.
