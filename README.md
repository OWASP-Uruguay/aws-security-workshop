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

### 🔍 Lista de vulnerabilidades intencionales

| Componente    | Vulnerabilidad                                                     |
|---------------|--------------------------------------------------------------------|
| S3            | ❌ Acceso público habilitado                                       |
| S3            | ❌ Permisos excesivos para la función Lambda (`grantReadWrite`)   |
| API Gateway   | ❌ Endpoint abierto al mundo, sin autenticación ni límites         |
| Lambda        | ❌ IAM role con más permisos de los necesarios                     |
| Lambda        | ❌ No hay validación de tamaño ni tipo del contenido recibido      |
| General       | ❌ No se genera ningún log o auditoría del acceso/uso              |
<!-- | API Gateway   | ❌ CORS completamente abierto (`*`)                                | -->

---

## 🧰 Ideas para hardening (mejoras)

- Agregar autenticación (API Key o IAM)
- Limitar el tamaño máximo del archivo
- Bloquear acceso público al bucket
- Usar políticas de IAM con permisos mínimos necesarios
- Restringir control de acceso al bucket para la función Lambda 
- Registrar eventos con CloudWatch Logs

---

## ✅ Soluciones

Soluciones propuestas están implementadas en los archivos `lib\solutions-sec-lab-cdk-stack.ts` y `lambda\solutions-index.js`. Estos pueden sobreescribir los archivos `lib\sec-lab-cdk-stack.ts` y `lambda\index.js` respectivamente para verificar arreglos. Requiere re-desplegar con `cdk deploy`.

---

## 🧼 Limpieza

Una vez finalizado el laboratorio, podés eliminar los recursos ejecutando:

```bash
cdk destroy
```

---

## 📚 Créditos

Este taller fue diseñado como ejercicio educativo para demostrar errores comunes de configuración en AWS. ¡No uses esta arquitectura en producción sin ajustes de seguridad!
