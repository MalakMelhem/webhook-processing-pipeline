CREATE TABLE pipelines (
    id SERIAL PRIMARY KEY,
    pipeline_name VARCHAR(100) NOT NULL,
    webhook_url TEXT NOT NULL UNIQUE,
    created_time TIMESTAMP DEFAULT NOW()
);
CREATE TABLE subscribers (
    id SERIAL PRIMARY KEY,
    pipeline_id INT NOT NULL,
    subscriber_url TEXT NOT NULL,
    created_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
);
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    pipeline_id INT NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_time TIMESTAMP DEFAULT NOW(),
    processed_time TIMESTAMP,
    FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
);
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    job_id INT NOT NULL,
    subscriber_id INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    attempts INT DEFAULT 0,
    created_time TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY ( subscriber_id) REFERENCES subscribers(id)
);

