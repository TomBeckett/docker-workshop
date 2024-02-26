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