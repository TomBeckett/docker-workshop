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

### Clean Up

See all running images

```bash
docker ps
```

Stop the image

```bash
docker stop <CONTAINER_ID_GOES_HERE> # Add your container image. For example 'docker stop 43acd01c7d1c'
```
