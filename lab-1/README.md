# LAB 1: Running your first container

## TASKS

- Create a Dockerfile for a simple web application
- Build the image using the Dockerfile and run the container
- Verify that the application is working as expected by accessing it in a web browser

### Installing NPM

Install [NodeJS](https://nodejs.org/en) and the app's dependencies.

```bash
sudo apt install npm # Install NPM
```

### Build and Test locally

```bash
npm i # Install dependencies
npm run build # Build the application
npm start # Run the application
```

Visit `http://localhost:8080`.

### Lets containerize!

Add a `Dockerfile` in the `lab-1` folder with the following contents:

```dockerfile
# Use the official Node.js 20 image as the base image
# This image includes Node.js and NPM installed on a Linux environment
FROM node:20

# Set the working directory inside the container
# This is the directory where your application's code will live in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
# These files define your application's dependencies
COPY package*.json ./

# Install the dependencies defined in package.json
# This step is run inside the container when building the image
RUN npm install

# Copy the rest of your application's source code to the working directory in the container
COPY . .

# Inform Docker that the container listens on the specified network port at runtime.
# This does not actually publish the port. It functions as a type of documentation
# between the person who builds the image and the person who runs the container, about which ports are intended to be published
EXPOSE 8080

# Define the command to start the application using npm start.
# This command is defined in package.json and usually runs the Node.js server.
CMD ["npm", "start"]
```

Build your image.

```bash
docker build -t my-node-app .
```

### Run your new image

```bash
docker run -d -p 8080:8080 my-node-app
```

Visit `http://localhost:8080`.

During the labs things may go wrong. In such cases he's some commands to remember:

### How to inspect a container

First lets see all images running.

```bash
docker ps # Show all running containers

CONTAINER ID   IMAGE         COMMAND                  CREATED          STATUS          PORTS                              NAMES
2002001b6798   my-node-app   "docker-entrypoint.s…"   45 seconds ago   Up 45 seconds   3000/tcp, 0.0.0.0:8080->8080/tcp   vigorous_driscoll
```

Next let's get the logs:

```bash
docker logs vigorous_driscoll # Replace vigorous_driscoll with the name or container id

> lab-2@1.0.0 start
> node dist/index.js

Server is running at http://localhost:8080
```

You can also _follow_ the logs in realtime using `-f` flag.

Finally, you can also run `docker inspect vigorous_driscoll` to see full JSON meta data on the container. This can be useful to see (among other things) network settings.

### How to get into a container

It's also possible to access the command line of a container:

```bash
docker exec -it vigorous_driscoll /bin/bash # Replace vigorous_driscoll with the name or container id

appuser@2002001b6798:/app$ ls -l # We're now inside container
total 44
drwxr-xr-x 1 appuser appuser  4096 Feb 26 08:54 dist
drwxr-xr-x 1 appuser appuser  4096 Feb 26 09:28 node_modules
-rw-r--r-- 1 appuser appuser 29939 Feb 26 09:28 package-lock.json
-rw-r--r-- 1 appuser appuser   289 Feb 26 08:54 package.json
```

This can be especially useful if the container has issues such as permissions errors, missing files, etc.

However this works if the container is already running. Often the container will fail to even run, in such cases use:

```bash
docker run -it [image_name] bash # Launch container and immediately attach to it.
```

### Clean Up

See all running images

```bash
docker ps
```

Stop the image

```bash
docker stop <CONTAINER_ID_GOES_HERE> # Add your container image. For example 'docker stop 43acd01c7d1c'
```
