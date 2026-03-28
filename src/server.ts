import express from "express";
import { Request, Response, NextFunction } from "express";
import { getPiplelineById,getPipelineByName, createPipeline, 
  updatePipleline, deletePipleline, 
  getPipelineId, createJob, 
  createSubscriber, getSubscriber,
  getJobs, getDeliveries, getJobById
 } from "./db/queries.js";
import "dotenv/config";
import "./worker.js";

const app = express();
const PORT = 8080;

app.use(express.static("."));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Webhook pipeline running");
});

/* =========================
   PIPELINES ROUTES
========================= */
app.post("/pipelines",async(req: Request,res: Response)=>{
  const {pipelineName, webhookUrl, actions} = req.body;

if (!pipelineName ||!webhookUrl ||! actions) {
  return res.status(400).json({ error: "Missing data" });
}
try{

const existing = await getPipelineByName(pipelineName);
  if (existing) {
    return res.status(409).json({ error: "Pipeline already exists" });
  }
const newPipeline=await createPipeline(pipelineName, webhookUrl, actions);
res.status(201).json(newPipeline);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}

});
app.get("/pipelines/:id", async(req: Request,res: Response)=>{
  const { id }= req.params;
try{
 const pipeline= await getPiplelineById(Number(id) );
 if (!pipeline) {
    return res.status(404).json({ error: "Pipeline not found" });
  }

  res.status(200).json(pipeline);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}

});
app.put("/pipelines/:id", async(req: Request,res: Response)=>{
  const { id }= req.params;
  const {pipelineName, webhookUrl}=req.body;

  if (!pipelineName || !webhookUrl) {
   return res.status(400).json({ error: "Missing data" });
  }
try{
  const updated= await updatePipleline(Number(id), pipelineName ,webhookUrl);
  if(!updated){
     return res.status(404).json({ error: "Pipeline not found" });
  }
  res.status(200).json(updated);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}
});
app.delete("/pipelines/:id", async(req: Request,res: Response)=>{
  const { id }= req.params;
try{
  const deleted= await deletePipleline(Number(id));  
  if(!deleted){
     return res.status(404).json({ error: "Pipeline not found" });
  }
  res.status(200).json(deleted);
}catch(err){
   console.error(err);
  res.status(500).json({ error: "Server error" });
}
});

/* =========================
   WEBHOOK ROUTE
========================= */
app.post("/webhooks/:webhookUrl",async(req: Request,res: Response)=>{
  const { webhookUrl }= req.params;
  const { payload } = req.body;

if (!payload) {
  return res.status(400).json({ error: "Missing data" });
}

try{
const pipelineId = await getPipelineId(webhookUrl as string);
  if (!pipelineId) {
    return res.status(404).json({ error: "Pipeline not found" });
  }
const addJob=await createJob(pipelineId, payload);
res.status(201).json(addJob);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}

});
/* =========================
   SUBSCRIBERS ROUTE
========================= */
app.post("/subscribers",async(req: Request,res: Response)=>{

const {pipelineId, subscriberUrl} = req.body;

if (!pipelineId ||!subscriberUrl) {
  return res.status(400).json({ error: "Missing data" });
}

try{
const existing = await getSubscriber(pipelineId, subscriberUrl);
  if (existing) {
    return res.status(409).json({ error: "Subscriber already exists" });
  }
const newSubscriber=await createSubscriber(pipelineId, subscriberUrl);
res.status(201).json(newSubscriber);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}
});
/* =========================
   JOBS ROUTES
========================= */
app.get("/jobs",async(req: Request,res: Response)=>{
try {
    const jobs = await getJobs();
    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/jobs/:id", async(req: Request,res: Response)=>{
  const { id }= req.params;
try{
 const job= await getJobById(Number(id) );
 if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.status(200).json(job);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}

});
/* =========================
   DELIVERIES ROUTE
========================= */
app.get("/deliveries",async(req: Request,res: Response)=>{
  try {
    const deliveries = await getDeliveries();
    res.status(200).json(deliveries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   A TEST ROUTE
========================= */
app.post("/test-subscriber", (req: Request, res: Response) => {
  console.log("Received from worker:", req.body);
  res.status(200).json({ message: "Received" });
});
app.post("/test-subscriber1", (req: Request, res: Response) => {
  console.log("Received from worker:", req.body);
  res.status(200).json({ message: "Received" });
});
app.post("/test-subscriber2", (req: Request, res: Response) => {
  console.log("Received from worker:", req.body);
  res.status(200).json({ message: "Received" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


