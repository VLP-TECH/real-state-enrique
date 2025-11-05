# 🚀 Guía de Despliegue en Producción - Vite.js

## 📋 Opción 1: Usando `serve` (Recomendado)

### Pasos:

```bash
# 1. Instalar dependencias
npm install

# 2. Construir el proyecto para producción
npm run build

# 3. Instalar serve globalmente (si no está instalado)
npm install -g serve

# 4. Servir los archivos estáticos
serve -s dist -l 4173 --cors
```

**O usar el script de npm:**
```bash
npm install
npm run build
npm run start
```

---

## 📋 Opción 2: Usando `vite preview`

### Pasos:

```bash
# 1. Instalar dependencias
npm install

# 2. Construir el proyecto
npm run build

# 3. Iniciar servidor de preview
npm run start
# o directamente:
vite preview --host 0.0.0.0 --port 4173
```

---

## 📋 Opción 3: Usando Nginx (Recomendado para producción real)

### Configuración de Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /ruta/a/tu/proyecto/dist;
    index index.html;

    # Servir archivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configurar MIME types correctos
    location ~* \.(js|mjs|ts|tsx)$ {
        add_header Content-Type application/javascript;
    }

    # Cache para assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Pasos:

```bash
# 1. Construir el proyecto
npm install
npm run build

# 2. Copiar archivos a la ubicación de Nginx
sudo cp -r dist/* /var/www/html/

# 3. Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📋 Opción 4: Usando Docker (Como está configurado)

### Pasos:

```bash
# 1. Construir la imagen Docker
docker build -t ecosistema-valencia .

# 2. Ejecutar el contenedor
docker run -d -p 4173:4173 --name ecosistema-valencia ecosistema-valencia

# 3. Ver logs
docker logs -f ecosistema-valencia
```

### O usando Docker Compose:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4173:4173"
    environment:
      - NODE_ENV=production
      - PORT=4173
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## 📋 Opción 5: Usando PM2 (Process Manager)

### Instalar PM2:

```bash
npm install -g pm2
```

### Crear archivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ecosistema-valencia',
    script: 'serve',
    args: '-s dist -l 4173 --cors',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    }
  }]
};
```

### Comandos PM2:

```bash
# 1. Construir el proyecto
npm install
npm run build

# 2. Instalar serve si no está
npm install -g serve

# 3. Iniciar con PM2
pm2 start ecosystem.config.js

# 4. Ver estado
pm2 status

# 5. Ver logs
pm2 logs ecosistema-valencia

# 6. Reiniciar
pm2 restart ecosistema-valencia

# 7. Detener
pm2 stop ecosistema-valencia
```

---

## 📋 Opción 6: Usando Supervisor

### Instalar Supervisor:

```bash
# Ubuntu/Debian
sudo apt-get install supervisor

# CentOS/RHEL
sudo yum install supervisor
```

### Crear archivo de configuración `/etc/supervisor/conf.d/ecosistema-valencia.conf`:

```ini
[program:ecosistema-valencia]
command=serve -s /ruta/completa/al/proyecto/dist -l 4173 --cors
directory=/ruta/completa/al/proyecto
user=tu-usuario
autostart=true
autorestart=true
stderr_logfile=/var/log/ecosistema-valencia.err.log
stdout_logfile=/var/log/ecosistema-valencia.out.log
environment=NODE_ENV="production",PORT="4173"
```

### Comandos Supervisor:

```bash
# 1. Construir el proyecto
cd /ruta/al/proyecto
npm install
npm run build

# 2. Instalar serve globalmente
npm install -g serve

# 3. Recargar configuración de supervisor
sudo supervisorctl reread
sudo supervisorctl update

# 4. Iniciar el servicio
sudo supervisorctl start ecosistema-valencia

# 5. Ver estado
sudo supervisorctl status ecosistema-valencia

# 6. Ver logs
sudo tail -f /var/log/ecosistema-valencia.out.log

# 7. Reiniciar
sudo supervisorctl restart ecosistema-valencia

# 8. Detener
sudo supervisorctl stop ecosistema-valencia
```

---

## 🔧 Variables de Entorno

Asegúrate de configurar las variables de entorno necesarias:

```bash
# Variables comunes para Vite
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon
NODE_ENV=production
PORT=4173
```

---

## ✅ Verificación Post-Despliegue

1. **Verificar que la aplicación carga:**
   ```bash
   curl http://localhost:4173
   ```

2. **Verificar que los assets se cargan correctamente:**
   - Abre el navegador en `http://tu-servidor:4173`
   - Abre las herramientas de desarrollador (F12)
   - Verifica que no haya errores en la consola
   - Verifica que los archivos JS/CSS se cargan correctamente en la pestaña Network

3. **Verificar logs:**
   - Si usas Docker: `docker logs ecosistema-valencia`
   - Si usas PM2: `pm2 logs ecosistema-valencia`
   - Si usas Supervisor: `sudo tail -f /var/log/ecosistema-valencia.out.log`

---

## 🐛 Troubleshooting

### Error: "Port already in use"
```bash
# Encontrar el proceso usando el puerto
lsof -ti:4173

# Matar el proceso
kill -9 $(lsof -ti:4173)
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "MIME type incorrect"
- Asegúrate de usar `serve` o configurar correctamente los MIME types en Nginx
- Verifica que el Dockerfile use `serve` como se configuró

### Error: "Build failed"
```bash
# Limpiar y reconstruir
rm -rf dist node_modules
npm install
npm run build
```

---

## 📝 Notas Importantes

1. **Puerto por defecto:** El proyecto está configurado para usar el puerto 4173
2. **Archivos estáticos:** Después de `npm run build`, los archivos están en la carpeta `dist/`
3. **CORS:** Si necesitas CORS, usa `--cors` con `serve` o configura Nginx
4. **HTTPS:** Para producción real, configura HTTPS con Let's Encrypt o certificado SSL

---

## 🚀 Script de Despliegue Rápido

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando despliegue..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Construir proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Verificar que dist existe
if [ ! -d "dist" ]; then
    echo "❌ Error: La carpeta dist no existe"
    exit 1
fi

echo "✅ Proyecto construido correctamente"
echo "📁 Archivos en: $(pwd)/dist"
echo "🌐 Para servir, ejecuta: serve -s dist -l 4173 --cors"
```

Guardar como `deploy.sh`, hacer ejecutable y ejecutar:
```bash
chmod +x deploy.sh
./deploy.sh
```

