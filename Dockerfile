# Stage 1: Build the Vite app
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/carebridge-facility/package*.json ./
RUN npm install

COPY frontend/carebridge-facility/ .
RUN npm run build

# Stage 2: Serve built files with nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
