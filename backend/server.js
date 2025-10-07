import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import geminiRoute from "./routes/geminiRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/gemini", geminiRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));