import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;

connectDb(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed", err.message);
    process.exit(1);
  });
