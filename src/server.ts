import express from "express";
import "dotenv/config";

const app = express();
const PORT = 8080;

app.use(express.static("."));

app.get("/", (req, res) => {
  res.send("Webhook pipeline running");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


