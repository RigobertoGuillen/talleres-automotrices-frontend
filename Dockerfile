# 1. Imagen base ligera de Node
FROM node:20-alpine

# 2. Carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar las dependencias
RUN npm install

# 5. Copiar el resto del código del frontend
COPY . .

# 6. Exponer el puerto por defecto de Vite
EXPOSE 5173

# 7. Arrancar el servidor de desarrollo de Vite
CMD ["npm", "run", "dev"]
