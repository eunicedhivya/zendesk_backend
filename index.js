import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// Reference Express App
const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

// Port for localhost
const PORT = process.env.PORT;

// Base EndPoint
app.get("/", (request, response) => {
  response.send({
    msg: "Zen Desk Clone",
  });
});

app.listen(PORT, () => console.log("Server is started in " + PORT));
