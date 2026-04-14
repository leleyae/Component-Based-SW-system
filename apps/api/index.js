const express = require("express");
const app = express();

app.use(express.json());

const designerRoutes = require("./routes/designer"); // ✅ added

app.use("/designer", designerRoutes); // ✅ added

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});