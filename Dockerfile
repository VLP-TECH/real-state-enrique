# Etapa 1: Build con Node
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Genera build de producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copia los archivos estáticos del build
COPY --from=builder /app/dist /usr/share/nginx/html
# Opcional: custom nginx.conf si usas rutas del lado cliente
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]