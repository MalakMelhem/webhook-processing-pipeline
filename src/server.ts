import express from "express";
import { Request, Response, NextFunction } from "express";
import { getPipleline, createPipeline, updatePipleline, deletePipleline, getPipelineId, createJob } from "./db/queries.js";
import "dotenv/config";

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
  const {pipelineName, webhookUrl} = req.body;

if (!pipelineName ||!webhookUrl) {
  return res.status(400).json({ error: "Missing data" });
}
try{

const existing = await getPipleline(pipelineName);
  if (existing) {
    return res.status(409).json({ error: "Pipeline already exists" });
  }
const newPipeline=await createPipeline(pipelineName, webhookUrl);
res.status(201).json(newPipeline);
}catch(err){
  console.error(err);
  res.status(500).json({ error: "Server error" });
}

});
app.get("/pipelines/:id", async(req: Request,res: Response)=>{
  const { id }= req.params;
try{
 const pipeline= await getPipleline(id as string);
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
  const updated= await updatePipleline(id as string, pipelineName ,webhookUrl);
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
  const deleted= await deletePipleline(id as string);  
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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


