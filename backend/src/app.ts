import express from "express";
import cors from "cors";
import templateRouter from "./routes/template";
import chatRouter from "./routes/chat";

export const app = express();

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
  }),
);
app.use(express.json());
app.use("/template", templateRouter);
app.use("/chat", chatRouter);
