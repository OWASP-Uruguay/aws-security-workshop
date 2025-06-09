# 🔐 Taller de Seguridad en AWS: Escenario de Subida de Archivos Inseguro

Este proyecto utiliza AWS CDK (en TypeScript) para desplegar una arquitectura sencilla pero **intencionalmente insegura**, que permite a los participantes identificar y corregir problemas comunes de configuración en servicios como S3, Lambda y API Gateway.

## 🧱 Arquitectura

- **API Gateway** con un endpoint POST abierto (`/upload`)
- **Lambda Function** que recibe datos JSON y guarda archivos en un bucket S3
- **Bucket S3** sin bloqueo de acceso público ni autenticación

## ⚙️ Requisitos

- Cuenta de AWS con acceso al Free Tier
- AWS CLI configurado (`aws configure`)
- Node.js >= 18
- CDK instalado globalmente: `npm install -g aws-cdk`
- Clonar este repositorio y ejecutar:

```bash
npm install
cdk bootstrap
cdk synth
cdk deploy
```

## 🧪 ¿Cómo probar?

Enviar una petición POST al endpoint proporcionado al desplegar con este formato:

```json
POST /upload
Content-Type: application/json

{
  "filename": "ejemplo.txt",
  "content": "Este es un contenido de prueba"
}
```

Podés usar `curl`:

```bash
curl -X POST <ENDPOINT_API>/upload \
     -H "Content-Type: application/json" \
     -d '{"filename": "demo.txt", "content": "archivo de prueba"}'
```

## 🕵️‍♀️ Actividad: Encontrar y mitigar las vulnerabilidades

El código fue diseñado con malas prácticas comunes. Tu tarea es **identificar y solucionar** los siguientes problemas, ya sea desde el código o directamente en la consola de AWS.

---

## 🧼 Limpieza

Una vez finalizado el laboratorio, podés eliminar los recursos ejecutando:

```bash
cdk destroy
```

---

## 📚 Créditos

Este taller fue diseñado como ejercicio educativo para demostrar errores comunes de configuración en AWS. ¡No uses esta arquitectura en producción sin ajustes de seguridad!
