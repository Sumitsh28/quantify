FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN if [ -f package.json ]; then npm install; else echo "No package.json found, skipping npm install"; fi

COPY . .

# Build the app (if package.json exists)
RUN if [ -f package.json ]; then npm run build; else mkdir dist && echo "Dummy build" > dist/index.html; fi

FROM nginx:alpine

# Copy the built assets from the build stage
# Vite outputs to /dist by default
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration for the frontend SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
