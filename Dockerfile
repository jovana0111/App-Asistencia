# Stage 1: Build
FROM node:18-slim AS build

# Habillitar corepack para pnpm
RUN corepack enable

WORKDIR /app

# Copiar package.json y pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con pnpm
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN pnpm build

# Stage 2: Serve
FROM nginx:alpine

# Copiar los archivos construidos a la carpeta de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx para manejar rutas de React (SPA) y proxy Odoo
RUN echo "server { \n\
    listen 80; \n\
    location /odoo-api/ { \n\
        proxy_pass https://srv.seishin.com.mx/; \n\
        proxy_set_header Host srv.seishin.com.mx; \n\
        proxy_ssl_server_name on; \n\
    } \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
