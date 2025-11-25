#!/bin/bash

# Script de despliegue rápido para AWS App Runner
# Asegúrate de tener AWS CLI configurado

set -e

echo "🚀 Iniciando despliegue en AWS App Runner..."

# Variables
REGION=${AWS_REGION:-us-east-1}
REPO_NAME="notaria-app"
SERVICE_NAME="notaria-app"

# Obtener Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✓ Account ID: $ACCOUNT_ID"

# Crear repositorio ECR si no existe
echo "📦 Verificando repositorio ECR..."
aws ecr describe-repositories --repository-names $REPO_NAME --region $REGION 2>/dev/null || \
  aws ecr create-repository --repository-name $REPO_NAME --region $REGION

REPO_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"
echo "✓ Repository URI: $REPO_URI"

# Login a ECR
echo "🔐 Autenticando con ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REPO_URI

# Build de la imagen
echo "🔨 Construyendo imagen Docker..."
docker build -t $REPO_NAME:latest .

# Tag y push
echo "📤 Subiendo imagen a ECR..."
docker tag $REPO_NAME:latest $REPO_URI:latest
docker push $REPO_URI:latest

echo "✅ Imagen subida exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Crea una instancia RDS PostgreSQL"
echo "2. Inicializa la base de datos con database/init.sql"
echo "3. Crea el servicio App Runner con:"
echo ""
echo "aws apprunner create-service \\"
echo "  --service-name $SERVICE_NAME \\"
echo "  --source-configuration '{...}' \\"
echo "  --instance-configuration '{...}'"
echo ""
echo "Ver guía completa en: docs/AWS_DEPLOYMENT.md"
