# Guía de Despliegue en Amazon Web Services (AWS)

Esta guía te ayudará a desplegar tu aplicación de notaría en AWS utilizando la capa gratuita.

## 📋 Prerequisitos

1. **Cuenta de AWS** ([Crear cuenta gratuita](https://aws.amazon.com/free/))
2. **AWS CLI** instalado ([Descargar aquí](https://aws.amazon.com/cli/))
3. **Docker** instalado localmente
4. Tarjeta de crédito/débito (para verificación, pero usaremos servicios gratuitos)

## 🎯 Servicios AWS que Usaremos

- **AWS App Runner** o **ECS Fargate**: Para ejecutar la aplicación (Opción 1 o 2)
- **RDS PostgreSQL**: Base de datos administrada
- **ECR**: Registro de contenedores Docker
- **Secrets Manager**: Para credenciales seguras (opcional)

---

## 🚀 Opción 1: AWS App Runner (Más Fácil - Recomendado)

App Runner es el equivalente a Cloud Run de Google, totalmente administrado y muy fácil de usar.

### Paso 1: Configurar AWS CLI

```bash
# Instalar AWS CLI (si no lo tienes)
# Windows: descargar desde https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configurar credenciales
aws configure
# Ingresa:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1 (o tu región preferida)
# - Default output format: json
```

### Paso 2: Crear RDS PostgreSQL

```bash
# Crear subnet group (necesario para RDS)
aws rds create-db-subnet-group \
  --db-subnet-group-name notaria-subnet-group \
  --db-subnet-group-description "Subnet group for notaria DB" \
  --subnet-ids subnet-xxxxx subnet-yyyyy

# Crear instancia RDS PostgreSQL (Free Tier)
aws rds create-db-instance \
  --db-instance-identifier notaria-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password TU_PASSWORD_SEGURO \
  --allocated-storage 20 \
  --db-name notaria_db \
  --backup-retention-period 7 \
  --publicly-accessible \
  --storage-type gp2

# Esperar a que esté disponible (toma ~5-10 minutos)
aws rds wait db-instance-available --db-instance-identifier notaria-db

# Obtener el endpoint
aws rds describe-db-instances \
  --db-instance-identifier notaria-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### Paso 3: Inicializar la Base de Datos

```bash
# Conectarse a RDS (reemplaza ENDPOINT con el endpoint de tu RDS)
psql -h ENDPOINT -U postgres -d notaria_db

# Ejecutar el script de inicialización
\i database/init.sql
\q
```

### Paso 4: Crear Repositorio ECR y Subir Imagen

```bash
# Crear repositorio ECR
aws ecr create-repository --repository-name notaria-app

# Obtener URI del repositorio
REPO_URI=$(aws ecr describe-repositories \
  --repository-names notaria-app \
  --query 'repositories[0].repositoryUri' \
  --output text)

echo "Repository URI: $REPO_URI"

# Login a ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $REPO_URI

# Build y push de la imagen
docker build -t notaria-app .
docker tag notaria-app:latest $REPO_URI:latest
docker push $REPO_URI:latest
```

### Paso 5: Desplegar en App Runner

```bash
# Crear archivo de configuración apprunner.yaml
cat > apprunner.yaml << 'EOF'
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - echo "Using pre-built Docker image"
run:
  runtime-version: 18
  command: node server/index.js
  network:
    port: 3001
  env:
    - name: NODE_ENV
      value: production
    - name: PORT
      value: "3001"
EOF

# Crear servicio App Runner (reemplaza los valores)
aws apprunner create-service \
  --service-name notaria-app \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'"$REPO_URI"':latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3001",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DB_HOST": "TU_RDS_ENDPOINT",
          "DB_PORT": "5432",
          "DB_NAME": "notaria_db",
          "DB_USER": "postgres",
          "DB_PASSWORD": "TU_PASSWORD",
          "PORT": "3001"
        }
      }
    },
    "AutoDeploymentsEnabled": false
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }'

# Obtener la URL del servicio
aws apprunner list-services
```

### Paso 6: Verificar el Despliegue

```bash
# Obtener detalles del servicio
aws apprunner describe-service \
  --service-arn arn:aws:apprunner:region:account:service/notaria-app/xxxxx

# La URL estará en ServiceUrl
# Probar: curl https://tu-url.awsapprunner.com/health
```

---

## 🎯 Opción 2: AWS ECS con Fargate (Más Control)

ECS Fargate te da más control sobre la configuración y es ideal para aplicaciones más complejas.

### Paso 1: Configurar AWS CLI (igual que Opción 1)

### Paso 2: Crear RDS PostgreSQL (igual que Opción 1)

### Paso 3: Crear Cluster ECS

```bash
# Crear cluster
aws ecs create-cluster --cluster-name notaria-cluster

# Verificar
aws ecs describe-clusters --clusters notaria-cluster
```

### Paso 4: Crear Task Definition

Crea el archivo `ecs-task-definition.json`:

```json
{
  "family": "notaria-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "notaria-app",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/notaria-app:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        },
        {
          "name": "DB_HOST",
          "value": "TU_RDS_ENDPOINT"
        },
        {
          "name": "DB_PORT",
          "value": "5432"
        },
        {
          "name": "DB_NAME",
          "value": "notaria_db"
        },
        {
          "name": "DB_USER",
          "value": "postgres"
        },
        {
          "name": "DB_PASSWORD",
          "value": "TU_PASSWORD"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/notaria-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Registrar la task definition:

```bash
# Crear log group
aws logs create-log-group --log-group-name /ecs/notaria-app

# Registrar task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### Paso 5: Crear Servicio ECS

```bash
# Crear servicio
aws ecs create-service \
  --cluster notaria-cluster \
  --service-name notaria-service \
  --task-definition notaria-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxx,subnet-yyyyy],
    securityGroups=[sg-xxxxx],
    assignPublicIp=ENABLED
  }"

# Verificar estado
aws ecs describe-services \
  --cluster notaria-cluster \
  --services notaria-service
```

### Paso 6: Configurar Application Load Balancer (Opcional)

```bash
# Crear ALB
aws elbv2 create-load-balancer \
  --name notaria-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Crear target group
aws elbv2 create-target-group \
  --name notaria-targets \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxxxx \
  --target-type ip

# Crear listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## 🔧 Configuración Avanzada

### Usar AWS Secrets Manager

```bash
# Crear secreto para la contraseña de BD
aws secretsmanager create-secret \
  --name notaria/db-password \
  --secret-string "TU_PASSWORD_SEGURO"

# Actualizar task definition para usar secretos
# En containerDefinitions, agregar:
"secrets": [
  {
    "name": "DB_PASSWORD",
    "valueFrom": "arn:aws:secretsmanager:region:account:secret:notaria/db-password"
  }
]
```

### Configurar Dominio Personalizado

```bash
# Usando Route 53
aws route53 create-hosted-zone --name tudominio.com

# Crear registro A apuntando a tu ALB o App Runner
```

### Monitoreo con CloudWatch

```bash
# Ver logs
aws logs tail /ecs/notaria-app --follow

# Crear alarma
aws cloudwatch put-metric-alarm \
  --alarm-name notaria-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## 💰 Estimación de Costos (Free Tier)

### Primer Año (Free Tier)
- **App Runner**: 2M requests/mes gratis
- **ECS Fargate**: 50GB-hora gratis/mes
- **RDS db.t3.micro**: 750 horas/mes gratis
- **ECR**: 500MB almacenamiento gratis
- **Total**: $0-5/mes (dentro de límites)

### Después del Free Tier
- **App Runner**: ~$25-40/mes
- **ECS Fargate**: ~$15-30/mes
- **RDS db.t3.micro**: ~$15-20/mes
- **Total estimado**: $55-90/mes

---

## 🔒 Mejores Prácticas de Seguridad

1. **Security Groups**: Configurar reglas restrictivas
2. **IAM Roles**: Usar roles con permisos mínimos
3. **Secrets Manager**: Nunca hardcodear contraseñas
4. **VPC**: Aislar recursos en VPC privada
5. **SSL/TLS**: Usar Certificate Manager para HTTPS
6. **WAF**: Activar AWS WAF para protección

### Configurar Security Group

```bash
# Crear security group
aws ec2 create-security-group \
  --group-name notaria-sg \
  --description "Security group for notaria app" \
  --vpc-id vpc-xxxxx

# Permitir tráfico HTTP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Permitir tráfico HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

---

## 🔄 CI/CD con AWS CodePipeline

Crea `buildspec.yml`:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/notaria-app
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker images...
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"notaria-app","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files: imagedefinitions.json
```

Crear pipeline:

```bash
# Crear CodeBuild project
aws codebuild create-project \
  --name notaria-build \
  --source type=GITHUB,location=https://github.com/tu-usuario/tu-repo \
  --artifacts type=NO_ARTIFACTS \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/standard:5.0,computeType=BUILD_GENERAL1_SMALL \
  --service-role arn:aws:iam::ACCOUNT_ID:role/CodeBuildServiceRole

# Crear pipeline
aws codepipeline create-pipeline --cli-input-json file://pipeline.json
```

---

## 📞 Comandos Útiles

```bash
# Ver logs de App Runner
aws apprunner list-operations --service-arn YOUR_SERVICE_ARN

# Ver logs de ECS
aws logs tail /ecs/notaria-app --follow

# Actualizar servicio ECS
aws ecs update-service \
  --cluster notaria-cluster \
  --service notaria-service \
  --force-new-deployment

# Escalar servicio
aws ecs update-service \
  --cluster notaria-cluster \
  --service notaria-service \
  --desired-count 2

# Detener servicio
aws ecs update-service \
  --cluster notaria-cluster \
  --service notaria-service \
  --desired-count 0
```

---

## 🆘 Troubleshooting

### Error: No se puede conectar a RDS
- Verificar security group permite conexiones desde tu IP/ECS
- Verificar que RDS es publicly accessible (para desarrollo)

### Error: Task no inicia
- Revisar logs en CloudWatch
- Verificar que la imagen Docker existe en ECR
- Verificar IAM roles tienen permisos correctos

### Error: Out of Memory
- Aumentar memoria en task definition
- Optimizar aplicación

---

## 📚 Recursos Adicionales

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS Free Tier](https://aws.amazon.com/free/)
