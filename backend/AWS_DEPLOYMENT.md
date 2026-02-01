# AWS Deployment Guide

## Option 1: AWS App Runner (Recommended)

### 1. Build and Push to ECR
```bash
# Create ECR repository
aws ecr create-repository --repository-name sachai-backend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t sachai-backend .
docker tag sachai-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/sachai-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/sachai-backend:latest
```

### 2. Create App Runner Service
```bash
# Create apprunner.yaml
cat > apprunner.yaml << EOF
version: 1.0
runtime: docker
build:
  commands:
    build:
      - echo "No build commands"
run:
  runtime-version: latest
  command: gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 voice_server:app
  network:
    port: 5000
    env: PORT
  env:
    - name: GROQ_API_KEY
      value: "your_groq_api_key"
    - name: ELEVENLABS_API_KEY
      value: "your_elevenlabs_api_key"
EOF
```

## Option 2: AWS ECS Fargate

### 1. Create Task Definition
```json
{
  "family": "sachai-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "sachai-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/sachai-backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "GROQ_API_KEY",
          "value": "your_groq_api_key"
        },
        {
          "name": "ELEVENLABS_API_KEY", 
          "value": "your_elevenlabs_api_key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sachai-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Environment Variables
Set these in AWS Systems Manager Parameter Store or Secrets Manager:
- `GROQ_API_KEY`
- `ELEVENLABS_API_KEY`

## Load Balancer Configuration
- **Protocol**: HTTP
- **Port**: 5000
- **Health Check**: `/health` (if implemented)
- **WebSocket Support**: Enable sticky sessions

## Security Groups
Allow inbound traffic on:
- Port 5000 (HTTP)
- Port 443 (HTTPS if using SSL)

## Scaling Configuration
- **Min instances**: 1
- **Max instances**: 10
- **Target CPU**: 70%
- **Target Memory**: 80%