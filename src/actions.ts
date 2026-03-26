
export function addData(payload: any){
const insertionTime = new Date().toISOString(); 
return {...payload, insertionTime}; 
}

export function transformData(payload: any){
const obj = {...payload};

Object.keys(obj).forEach(key => {
    if(key.includes("name")){
    const newKey = key.replace("name", "username"); // Replace "name" with an "username" string
    obj[newKey] = obj[key]; 
    delete obj[key]; 
    } 
return obj;  
});

}

export function filterData(payload: any){
const obj = {...payload};
["age", "country", "email"].forEach(key => {
  delete obj[key];
});
return obj;
}