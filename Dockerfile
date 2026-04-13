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
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
