const dotenv = require("dotenv");
const connectDB = require("./db");
const app = require("./app");

// Load env vars
dotenv.config();

// Call Imported function to connect to the database
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
