
export function addData(payload: any){
console.log("filterData input:", payload);
const insertionTime = new Date().toISOString(); 

const result= {...payload, insertionTime}; 
console.log("filterData output:", result);
return result;
}

export function transformData(payload: any){
const obj = {...payload};

Object.keys(obj).forEach(key => {
    if(key.includes("name")){
    const newKey = key.replace("name", "username"); // Replace "name" with an "username" string
    obj[newKey] = obj[key]; 
    delete obj[key]; 
    } 
 
});
  return obj; 
}

export function filterData(payload: any){
const obj = {...payload};
["age", "country", "email"].forEach(key => {
  delete obj[key];
});
return obj;
}