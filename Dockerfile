# Build
FROM node:20-alpine AS builder
WORKDIR /app
# Manifests dentro de src
COPY src/package*.json ./
RUN npm ci
# Código + index.html (ahora debe estar en src por la root)
COPY src/ .
RUN npm run build

# Serve estático
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
