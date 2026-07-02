import dotenv from "dotenv/config";
import connectDatabase from "./db/dbConnection.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

connectDatabase()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at PORT: ${PORT}`);
    });
})
.catch((error) => {
    console.error("MongoDB connection failed:", error);
});