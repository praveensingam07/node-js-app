const express = require("express");
const app = express();

// Capture deployment time when app starts
const deployedTime = new Date().toLocaleString();

app.get("/", (req, res) => {
  res.send(`Hello CI/CD 🚀<br>Deployed at: ${deployedTime}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Deployed at: ${deployedTime}`);
});