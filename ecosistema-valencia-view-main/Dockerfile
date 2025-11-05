# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Install serve for static file serving with correct MIME types
RUN npm install -g serve

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 4173

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4173

# Start the application with serve (better MIME type handling)
CMD ["serve", "-s", "dist", "-l", "4173", "--cors"]
