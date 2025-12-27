import app from "./app.js";
import { connectDB } from "./config/db.config.js";
import { connectRedis } from "./config/redis.config.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
    await connectRedis();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}   

startServer();

//Graceful Shutdown
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    process.exit();
});