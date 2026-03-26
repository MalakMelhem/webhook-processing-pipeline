import { getNextJob, markJobAsCompleted, markJobAsFailed } from "./db/queries.js";
import { addData, transformData, filterData} from "./actions.js";

const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes

async function pollTask() {
    try{
   
    console.log("Running query script...");
    
    // Perform async task (e.g., DB query)
    const job= await getNextJob();

    if(!job){
    console.log("No jobs found");
    return;
    }
    console.log(`Processing job ${job.id} with action ${job.actions}`);
    try{
    const resultData=runPipeline(job); 

    if ( Object.keys(resultData).length === 0) {
    await markJobAsFailed(job.id, "Filtered out");
    return;
    }    
    
    await markJobAsCompleted(job.id, resultData);

    } catch (err: any) {
    await markJobAsFailed(job.id, err.message);
  
    }

    }catch(err){ 
        console.error("Worker error:", err);
    }
   finally{
    // Schedule next run only after this one finishes
    setTimeout(pollTask, POLL_INTERVAL);
    }
}


// Start the first poll
// setTimeout(pollTask, POLL_INTERVAL);

// Start immediately
pollTask();

function runPipeline(job:any): any{   
let data=job.payload;
if (!job.actions || job.actions.length === 0) {
    throw new Error("No actions defined for pipeline");
}
for(const action of job.actions){
 switch (action) {
        case "filter":
            data= filterData(data);
            break;
        case "transform":
            data=transformData(data);
            break;
        case "add":
            data= addData(data);
            break;
        }
    }
    return data;
}

