
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


