# Use the official Node.js 18 LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (match your .env or default 10017)
EXPOSE 10017

# Start the app
CMD ["node", "index.js"]