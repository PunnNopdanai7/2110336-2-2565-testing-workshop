FROM node:alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Set an environment variable
ENV PORT 8080

# Expose the specified port
EXPOSE $PORT

# Start the application
CMD [ "npm", "start" ]
