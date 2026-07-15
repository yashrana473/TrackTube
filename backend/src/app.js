import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

// Setting request limit 
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.send("<h1>Server is Live!</h1><p>Right-click, hit Inspect, and run your script in the Console now.</p>");
});

import userRouter from "./routes/user.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/playlists", playlistRouter);

export { app };