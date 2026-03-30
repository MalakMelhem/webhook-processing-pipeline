# Webhook-Driven Task Processing Pipeline

This project is a webhook-driven task processing service. It receives incoming webhooks, queues them as jobs, processes them asynchronously, and delivers the results to registered subscribers.

The system is built around the concept of pipelines, where each pipeline defines how incoming data flows from source to processing to delivery.

A pipeline connects three components:

1. **Source** — a unique webhook URL that receives incoming requests
2. **Processing Actions** — a sequence of transformations applied to the data (e.g., filter, transform, add)
3. **Subscribers** — one or more endpoints that receive the processed result

## Features

- CRUD API for managing pipelines
- Webhook ingestion that queues jobs for background processing
- Worker system for asynchronous job execution
- Multiple processing actions:
- Filter
- Transform
- Add
- Delivery of processed results to subscribers
- Retry mechanism for failed deliveries
- APIs to inspect:
- Jobs
- Job status
- Delivery attempts

## API Endpoints

### Pipelines

#### Create Pipeline

```Bash
POST /pipelines
```

**Request Body:**

```json
{
  "pipelineName": "test",
  "webhookUrl": "test-30",
  "actions": ["filter", "transform", "add"]
}
```

#### Get Pipeline by ID

```Bash
GET /pipelines/:id
```

**Response**

```json
{
  "id": 1,
  "pipeline_name": "test",
  "actions": ["filter", "transform", "add"],
  "webhook_url": "test-30",
  "created_time": "timestamp"
}
```

#### Update Pipeline

```Bash
PUT /pipelines/:id
```

**Request Body:**

```json
{
  "pipelineName": "updated_pipeline",
  "webhookUrl": "new-url"
}
```

#### Delete Pipeline

```Bash
DELETE /pipelines/:id
```

Deletes a pipeline by its ID.

### Webhook Endpoint

Each pipeline has a unique webhook URL:

```Bash
POST /webhooks/:webhookUrl
```

**Request Body Example:**

```json
{
  "payload": {
    "message": "Hi from job testing-30",
    "value": 69,
    "name": "malak",
    "email": "malak@gmail.com",
    "age": 30,
    "score": 81
  }
}
```

This request creates a job that will be processed asynchronously.

### Jobs Routes

#### Get All Jobs

```Bash
GET /jobs
```

#### Get Job by ID

```Bash
GET /jobs/:id
```

### Deliveries

#### Get Delivery Attempts

```Bash
GET /deliveries
```

## Tech Stack

- TypeScript
- Node.js + Express
- PostgreSQL
- Async/Await for asynchronous operations

## Design Decisions

- Jobs are processed asynchronously using a worker to avoid blocking API requests
- Pipelines provide a flexible way to define data processing flows
- Retry logic ensures reliable delivery to subscribers
- PostgreSQL is used for persistence and tracking jobs and deliveries

## Setup & Installation

1. Clone the repository:

```Bash
git clone https://github.com/MalakMelhem/webhook-processing-pipeline.git
cd webhook-processing-pipeline
```

2. Install dependencies:

```Bash
npm install
```

3. Configure environment variables:
   Create a `.env` file and add:
   `DATABASE_URL=your_database_url`

4. Run the project:

```Bash
npm run dev
```
