import { pool } from "./index.js";

export async function createPipeline(pipelineName:string, webhookUrl:string){
    const createdTime = new Date().toISOString(); 
    const query ='INSERT INTO pipelines (pipeline_name, webhook_url, created_time) VALUES ($1,$2,$3) RETURNING * ;';
    const values =[pipelineName,webhookUrl,createdTime];
    const result=await pool.query(query,values);
    return result.rows[0];
}
export async function createSubscriber(pipelineId:string, subscriberUrl:string){
    const createdTime = new Date().toISOString(); 
    const query ='INSERT INTO subscribers (pipeline_id, subscriber_url, created_time) VALUES ($1,$2,$3)';
    const values =[pipelineId,subscriberUrl,createdTime];
    const result=await pool.query(query,values);
}
export async function getPipleline(id: string) {
    const query = 'SELECT * FROM pipelines WHERE id = $1';
    const result=await pool.query(query,[id]);
    return result.rows[0];
}
export async function updatePipleline(id: string, pipelineName: string, webhookUrl: string){
    const query = 'UPDATE pipelines SET pipeline_name = $1, webhook_url = $2 WHERE id = $3 RETURNING * ;';
    const values = [pipelineName, webhookUrl, id];
    const result=await pool.query(query,values);
    return result.rows[0];
}
export async function deletePipleline(id: string){
   const query = 'DELETE FROM pipelines WHERE id = $1 RETURNING *; ';
   const result=await pool.query(query,[id]);
   return result.rows[0];
}

export async function createJob(pipelineId: string, payload: object){
    const createdTime = new Date().toISOString(); 
    const query ='INSERT INTO jobs (pipeline_id, payload, created_time) VALUES ($1,$2,$3) RETURNING * ;';
    const values =[pipelineId ,payload, createdTime ];
    const result=await pool.query(query,values);
    return result.rows[0];
}
export async function getPipelineId(webhookUrl: string) {
    const query = 'SELECT id FROM pipelines WHERE webhook_url = $1';
    const result=await pool.query(query,[webhookUrl]);
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
    const result=await pool.query(query);
    const job= result.rows[0];
     if (!job) return null;
    // fetch pipeline actions separately
    const pipelineQuery = 'SELECT actions FROM pipelines WHERE id = $1';
    const pipelineResult = await pool.query(pipelineQuery, [job.pipeline_id]);
    job.actions = pipelineResult.rows[0]?.actions;
    return job;
}

export async function markJobAsCompleted(id:string, resultData: any){
    const query = `UPDATE jobs SET status = 'completed', result = $1, processed_time = NOW() WHERE id = $2 RETURNING *;`;
    const result=await pool.query(query, [resultData, id]);
    return result.rows[0];
}
export async function markJobAsFailed( id:string, error: string){
    const query = `UPDATE jobs SET status = 'failed', processed_time = NOW(), error =$1 WHERE id = $2 RETURNING *;`;
    const result=await pool.query(query, [ error, id]);
    return result.rows[0];
}





