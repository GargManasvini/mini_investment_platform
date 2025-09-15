# --- Stage 1: Build the React Application ---
# FIX: Updated to a newer version of Node.js (20) that is compatible with Vite.
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# --- Stage 2: Serve the Application with Nginx ---
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

