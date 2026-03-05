# ---- Build stage ----
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app into the /neoview sub-path
COPY --from=build /app/build /usr/share/nginx/html/neoview

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
