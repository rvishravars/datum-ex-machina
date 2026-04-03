# Frontend / React Dockerfile
# Stage 1: Build the React application
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the production bundle
COPY . .
RUN CI=true npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output to Nginx's serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration template
# The Nginx Docker image (since 1.19) automatically runs envsubst 
# on any .template files in /etc/nginx/templates/ and outputs to /etc/nginx/conf.d/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Default env vars for local testing of the container
ENV PORT=80
ENV BACKEND_URL=http://backend:8080

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
