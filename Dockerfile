# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application with environment variables
ARG VITE_API_URL
ARG VITE_API_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_KEY=${VITE_API_KEY}
RUN npm run build

# Expose the application port
EXPOSE 3000

# Serve the built application with the backend
CMD ["node", "server/index.js"]