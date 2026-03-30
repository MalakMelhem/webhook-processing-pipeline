import { pool } from "./index.js";

export async function createPipeline(
  pipelineName: string,
  webhookUrl: string,
  actions: string[],
) {
  const createdTime = new Date().toISOString();
  const query =
    "INSERT INTO pipelines (pipeline_name, webhook_url, created_time, actions) VALUES ($1,$2,$3,$4) RETURNING * ;";
  const values = [
    pipelineName,
    webhookUrl,
    createdTime,
    JSON.stringify(actions),
  ];
  return (await pool.query(query, values)).rows[0];
}
export async function createSubscriber(
  pipelineId: string,
  subscriberUrl: string,
) {
  const createdTime = new Date().toISOString();
  const query =
    "INSERT INTO subscribers (pipeline_id, subscriber_url, created_time) VALUES ($1,$2,$3)";
  const values = [pipelineId, subscriberUrl, createdTime];
  await pool.query(query, values);
}
export async function getPiplelineById(id: number) {
  const query = "SELECT * FROM pipelines WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}
export async function getPipelineByName(pipelineName: string) {
  const query = `SELECT * FROM pipelines WHERE pipeline_name = $1;`;
  const result = await pool.query(query, [pipelineName]);
  return result.rows[0];
}
export async function getSubscriber(pipelineId: number, subscriberUrl: string) {
  const query =
    "SELECT * FROM subscribers WHERE pipeline_id = $1 and subscriber_url =$2 ";
  const result = await pool.query(query, [pipelineId, subscriberUrl]);
  return result.rows[0];
}
export async function updatePipleline(
  id: number,
  pipelineName: string,
  webhookUrl: string,
) {
  const query =
    "UPDATE pipelines SET pipeline_name = $1, webhook_url = $2 WHERE id = $3 RETURNING * ;";
  const values = [pipelineName, webhookUrl, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}
export async function deletePipleline(id: number) {
  const query = "DELETE FROM pipelines WHERE id = $1 RETURNING *; ";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

export async function createJob(pipelineId: number, payload: object) {
  const createdTime = new Date().toISOString();
  const query =
    "INSERT INTO jobs (pipeline_id, payload, created_time) VALUES ($1,$2,$3) RETURNING * ;";
  const values = [pipelineId, payload, createdTime];
  const result = await pool.query(query, values);
  return result.rows[0];
}
export async function getJobs() {
  const query = "SELECT * FROM jobs ORDER BY id DESC;";
  const result = await pool.query(query);
  return result.rows;
}
export async function getJobById(id: number) {
  const query = "SELECT * FROM jobs WHERE id =$1;";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}
export async function getPipelineId(webhookUrl: string) {
  const query = "SELECT id FROM pipelines WHERE webhook_url = $1";
  const result = await pool.query(query, [webhookUrl]);
  return result.rows[0]?.id;
}
export async function getNextJob() {
  const query = ` UPDATE jobs
    SET status = 'processing'
    WHERE id = (
      SELECT id FROM jobs
      WHERE status = 'pending'
      ORDER BY created_time ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;`;
  const result = await pool.query(query);
  const job = result.rows[0];
  if (!job) return null;
  // fetch pipeline actions separately
  const pipelineQuery = "SELECT actions FROM pipelines WHERE id = $1";
  const pipelineResult = await pool.query(pipelineQuery, [job.pipeline_id]);
  job.actions = pipelineResult.rows[0]?.actions;
  return job;
}

export async function markJobAsCompleted(id: number, resultData: any) {
  const query = `UPDATE jobs SET status = 'completed', result = $1, processed_time = NOW() WHERE id = $2 RETURNING *;`;
  const result = await pool.query(query, [resultData, id]);
  return result.rows[0];
}
export async function markJobAsFailed(id: number, error: string) {
  const query = `UPDATE jobs SET status = 'failed', processed_time = NOW(), error =$1 WHERE id = $2 RETURNING *;`;
  const result = await pool.query(query, [error, id]);
  return result.rows[0];
}
export async function getSubscribers(pipelineId: number) {
  const query = `SELECT * FROM subscribers WHERE pipeline_id = $1;`;
  const result = await pool.query(query, [pipelineId]);
  return result.rows;
}
export async function markDelivered(jobId: number, subscriberId: number) {
  const query = `UPDATE deliveries SET status = 'delivered' WHERE job_id = $1 AND subscriber_id = $2 RETURNING *;`;
  const result = await pool.query(query, [jobId, subscriberId]);
  return result.rows[0];
}
export async function markFailed(jobId: number, subscriberId: number) {
  const query = `UPDATE deliveries SET status = 'failed' WHERE job_id = $1 AND subscriber_id = $2 RETURNING *; `;
  const result = await pool.query(query, [jobId, subscriberId]);
  return result.rows[0];
}
export async function getDeliveries() {
  const query = `SELECT * FROM deliveries ;`;
  const result = await pool.query(query);
  return result.rows;
}
export async function deliveryAttempts(jobId: number, subscriberId: number) {
  const updateQuery = `UPDATE deliveries SET attempts = attempts + 1 WHERE job_id = $1 AND subscriber_id = $2 RETURNING *; `;
  const updateResult = await pool.query(updateQuery, [jobId, subscriberId]);

  if (updateResult.rows.length > 0) {
    return updateResult.rows[0];
  }

  const createdTime = new Date().toISOString();
  const insertQuery = `INSERT INTO deliveries (job_id, subscriber_id, status, attempts, created_time) VALUES ($1, $2, $3, $4, $5) RETURNING *; `;

  const insertResult = await pool.query(insertQuery, [
    jobId,
    subscriberId,
    "pending",
    1,
    createdTime,
  ]);
  return insertResult.rows[0];
}
