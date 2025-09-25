# AskKnightro

AskKnightro is a fullstack educational platform that enables instructors to upload course materials and students to search them intelligently using vector search. The stack includes a **React** frontend, **Spring Boot** backend, and a **PostgreSQL** and **Milvus** database.

## Tech Stack

- **Frontend**: React
- **Backend**: Spring Boot, Java 17+, Maven
- **Database**: PostgreSQL, Milvus
- **Dev Tools**: Docker, Postman

## Prerequisites

Before you get started, make sure you have:

- [Node.js](https://nodejs.org/) v20
- [Java JDK 17](https://adoptopenjdk.net/)
- [Maven](https://maven.apache.org/) or use `./mvnw`
- [PostgreSQL](https://www.postgresql.org/) running locally or via Docker
- [Milvus](https://milvus.io/docs/install-overview.md) with a Standalone or Distributed Instance

## Backend Setup (Spring Boot)

**Clone the project**:

```bash
git clone https://github.com/your-username/askknightro.git
cd askknightro/backend
```

**Set your Spring Application Configurations**

```
spring.application.name=<ApplicationName>
server.port=<Port>

```

**Configure PostgreSQL credentials in src/main/resources/application.properties**:

```
spring.datasource.url=jdbc:postgresql://localhost:<Port>/<DatabaseName>
spring.datasource.username=<Username>
spring.datasource.password=<Password>

```

**Configure OpenAI API Keys and Configss**

```
spring.ai.openai.api-key=
spring.ai.openai.embedding.options.model=<ModelName>
```

**Configure Milvus**

```
spring.ai.vectorstore.milvus.client.host=<Url>
spring.ai.vectorstore.milvus.client.port=<Port>
spring.ai.vectorstore.milvus.client.secure=<Boolean>
spring.ai.vectorstore.milvus.collection-name=<VectorStoreName>
spring.ai.vectorstore.milvus.databaseName=<DatabaseName>
spring.ai.vectorstore.milvus.embeddingDimension=<Dimensions> #Should match the embedding dimension of your embedding model
spring.ai.vectorstore.milvus.indexType=<IndexType>
spring.ai.vectorstore.milvus.metricType=<MetricType>
```

Run the AskKnightroApplication file to start the backend at: http://localhost:<Port>

## Frontend Setup (React)

**Navigate to Frontend, Install Dependencies, Start the app**

```
cd ../frontend
npm install
npm start
```

Frontend should run on: http://localhost:3000

## Database setup

**Refer to schema defintions found [here](https://github.com/AskKnightro/AskKnightroSQL) for Table setup**

## CI/CD to AWS Fargate

This repo includes a GitHub Actions workflow that builds Docker images for `frontend` and `backend`, pushes them to Amazon ECR, and updates two Amazon ECS services running on Fargate.

### Files added

- `.github/workflows/aws-fargate.yml`
- `infra/ecs-taskdef-backend.json`
- `infra/ecs-taskdef-frontend.json`

### Prerequisites in AWS

- ECR repositories for frontend and backend.
- An ECS cluster with two services (frontend and backend) using Fargate launch type, each with an ALB or NLB and awsvpc networking.
- IAM roles:
  - Execution role for ECS tasks with access to ECR and CloudWatch Logs.
  - Task role for application AWS access (if needed).
  - GitHub OIDC or Access Keys for the workflow to call AWS APIs.

Update the `infra/ecs-taskdef-*.json` placeholders at deployment-time via the workflow. Placeholders used: `${EXECUTION_ROLE_ARN}`, `${TASK_ROLE_ARN}`, `${AWS_REGION}`, container name vars.

### GitHub repository variables (Settings → Secrets and variables → Actions → Variables)

- `AWS_REGION`
- `ECR_FRONTEND_REPOSITORY` (name only, e.g. `askknightro-frontend`)
- `ECR_BACKEND_REPOSITORY` (name only, e.g. `askknightro-backend`)
- `ECS_CLUSTER` (cluster name)
- `ECS_SERVICE_FRONTEND` (service name)
- `ECS_SERVICE_BACKEND` (service name)
- `CONTAINER_NAME_FRONTEND` (must match name in your ECS service task definition)
- `CONTAINER_NAME_BACKEND`

### GitHub repository secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Alternatively, configure GitHub OIDC and use a role with `configure-aws-credentials` `role-to-assume` instead of access keys.

### How it works

On push to `main` (or manual trigger):

- Builds `backend/Dockerfile` and `frontend/Dockerfile` images.
- Tags with `:SHA` and `:latest`, pushes to ECR.
- Renders the task definition with the new image for each service.
- Deploys updated task definitions to ECS services and waits for stability.

If your containers listen on non-default ports, adjust `containerPort` in the task def JSONs.
