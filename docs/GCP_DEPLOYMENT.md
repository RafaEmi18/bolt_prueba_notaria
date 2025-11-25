# Guía de Despliegue en Google Cloud Platform

Esta guía te ayudará a desplegar tu aplicación de notaría en Google Cloud Platform (GCP).

## 📋 Prerequisitos

1. **Cuenta de GCP** con facturación habilitada
2. **Google Cloud SDK** instalado ([Descargar aquí](https://cloud.google.com/sdk/docs/install))
3. **Docker** instalado localmente
4. Proyecto creado en GCP

## 🚀 Opción 1: Cloud Run (Recomendado)

Cloud Run es ideal para comenzar: serverless, escalado automático, y pago por uso.

### Paso 1: Configurar Google Cloud SDK

```bash
# Iniciar sesión
gcloud auth login

# Configurar proyecto
gcloud config set project TU_PROJECT_ID

# Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Paso 2: Crear Cloud SQL (PostgreSQL)

```bash
# Crear instancia de Cloud SQL
gcloud sql instances create notaria-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Crear base de datos
gcloud sql databases create notaria_db \
  --instance=notaria-db

# Crear usuario
gcloud sql users create notaria_user \
  --instance=notaria-db \
  --password=TU_PASSWORD_SEGURO

# Obtener el connection name (lo necesitarás después)
gcloud sql instances describe notaria-db --format="value(connectionName)"
```

### Paso 3: Inicializar la Base de Datos

```bash
# Conectarse a Cloud SQL
gcloud sql connect notaria-db --user=postgres

# Una vez conectado, ejecutar:
\c notaria_db
\i database/init.sql
\q
```

### Paso 4: Construir y Subir la Imagen Docker

```bash
# Configurar Docker para usar Google Container Registry
gcloud auth configure-docker

# Construir la imagen
docker build -t gcr.io/TU_PROJECT_ID/notaria-app:latest .

# Subir la imagen
docker push gcr.io/TU_PROJECT_ID/notaria-app:latest
```

### Paso 5: Desplegar en Cloud Run

```bash
# Obtener el connection name de tu instancia SQL
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe notaria-db --format="value(connectionName)")

# Desplegar
gcloud run deploy notaria-app \
  --image gcr.io/TU_PROJECT_ID/notaria-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances $INSTANCE_CONNECTION_NAME \
  --set-env-vars "DB_HOST=/cloudsql/$INSTANCE_CONNECTION_NAME" \
  --set-env-vars "DB_PORT=5432" \
  --set-env-vars "DB_NAME=notaria_db" \
  --set-env-vars "DB_USER=notaria_user" \
  --set-env-vars "DB_PASSWORD=TU_PASSWORD_SEGURO" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "PORT=3001"
```

### Paso 6: Verificar el Despliegue

```bash
# Obtener la URL del servicio
gcloud run services describe notaria-app \
  --platform managed \
  --region us-central1 \
  --format "value(status.url)"

# Probar el health check
curl https://TU_URL/health
```

---

## 🎯 Opción 2: Google Kubernetes Engine (GKE)

GKE ofrece más control y es ideal para aplicaciones que requieren configuraciones avanzadas.

### Paso 1: Crear Cluster de GKE

```bash
# Crear cluster
gcloud container clusters create notaria-cluster \
  --num-nodes=2 \
  --machine-type=e2-medium \
  --region=us-central1

# Obtener credenciales
gcloud container clusters get-credentials notaria-cluster \
  --region=us-central1
```

### Paso 2: Crear Cloud SQL (igual que Opción 1)

Sigue los pasos 2 y 3 de la Opción 1 para crear Cloud SQL.

### Paso 3: Crear Secretos de Kubernetes

```bash
# Crear secret para credenciales de base de datos
kubectl create secret generic db-credentials \
  --from-literal=DB_HOST=/cloudsql/INSTANCE_CONNECTION_NAME \
  --from-literal=DB_PORT=5432 \
  --from-literal=DB_NAME=notaria_db \
  --from-literal=DB_USER=notaria_user \
  --from-literal=DB_PASSWORD=TU_PASSWORD_SEGURO
```

### Paso 4: Crear Archivos de Deployment

Crea `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notaria-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: notaria-app
  template:
    metadata:
      labels:
        app: notaria-app
    spec:
      containers:
      - name: notaria-app
        image: gcr.io/TU_PROJECT_ID/notaria-app:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        envFrom:
        - secretRef:
            name: db-credentials
      - name: cloud-sql-proxy
        image: gcr.io/cloudsql-docker/gce-proxy:latest
        command:
          - "/cloud_sql_proxy"
          - "-instances=INSTANCE_CONNECTION_NAME=tcp:5432"
---
apiVersion: v1
kind: Service
metadata:
  name: notaria-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3001
  selector:
    app: notaria-app
```

### Paso 5: Desplegar en GKE

```bash
# Aplicar deployment
kubectl apply -f k8s/deployment.yaml

# Verificar pods
kubectl get pods

# Obtener IP externa
kubectl get service notaria-service
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno Adicionales

```bash
# Para Cloud Run
gcloud run services update notaria-app \
  --set-env-vars "CORS_ORIGIN=https://tudominio.com"

# Para GKE
kubectl set env deployment/notaria-app CORS_ORIGIN=https://tudominio.com
```

### Configurar Dominio Personalizado

#### Cloud Run
```bash
# Mapear dominio
gcloud run domain-mappings create \
  --service notaria-app \
  --domain tudominio.com \
  --region us-central1
```

#### GKE
Usa Google Cloud Load Balancer o un Ingress controller.

### Monitoreo y Logs

```bash
# Ver logs en Cloud Run
gcloud run services logs read notaria-app \
  --region us-central1 \
  --limit 50

# Ver logs en GKE
kubectl logs -f deployment/notaria-app
```

---

## 💰 Estimación de Costos

### Cloud Run (Uso Bajo-Medio)
- **Cloud Run**: ~$5-20/mes
- **Cloud SQL (db-f1-micro)**: ~$7-15/mes
- **Container Registry**: ~$1-5/mes
- **Total estimado**: $13-40/mes

### GKE (Uso Medio)
- **GKE Cluster**: ~$70-100/mes
- **Cloud SQL**: ~$7-15/mes
- **Load Balancer**: ~$18/mes
- **Total estimado**: $95-133/mes

---

## 🔒 Mejores Prácticas de Seguridad

1. **Nunca expongas credenciales** en el código
2. **Usa Secret Manager** para datos sensibles
3. **Habilita SSL/TLS** (automático en Cloud Run)
4. **Configura IAM** apropiadamente
5. **Habilita Cloud Armor** para protección DDoS
6. **Usa VPC** para aislar recursos

### Usar Secret Manager

```bash
# Crear secreto
echo -n "TU_PASSWORD" | gcloud secrets create db-password --data-file=-

# Dar acceso a Cloud Run
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

# Usar en Cloud Run
gcloud run deploy notaria-app \
  --set-secrets="DB_PASSWORD=db-password:latest"
```

---

## 🔄 CI/CD con Cloud Build

Crea `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/notaria-app:$COMMIT_SHA', '.']
  
  # Push the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/notaria-app:$COMMIT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'notaria-app'
      - '--image'
      - 'gcr.io/$PROJECT_ID/notaria-app:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/notaria-app:$COMMIT_SHA'
```

Configurar trigger:
```bash
gcloud builds triggers create github \
  --repo-name=TU_REPO \
  --repo-owner=TU_USUARIO \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

---

## 📞 Soporte

Para problemas o preguntas:
- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Documentación de GKE](https://cloud.google.com/kubernetes-engine/docs)
- [Documentación de Cloud SQL](https://cloud.google.com/sql/docs)
