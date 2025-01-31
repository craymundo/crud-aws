# Use Node.js versión 20 como base
FROM node:20

# Actualizar el sistema e instalar herramientas básicas de desarrollo
RUN apt update && apt install -y less man-db sudo

# Configurar el usuario predeterminado para que tenga acceso a sudo
ARG USERNAME=node
RUN echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Establecer una variable de entorno para indicar que este es un devcontainer
ENV DEVCONTAINER=true

# Establecer el directorio de trabajo
WORKDIR /workspace

# Copiar los archivos del proyecto al contenedor
COPY . /workspace

# Instalar las dependencias del proyecto
RUN npm install

# Comando para mantener el contenedor activo
CMD ["npm", "run", "start:local"]
