const express = require("express");
const bodyParser = require("body-parser");
const { Profile } = require("./models/profile.js");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/profiles", async (req, res) => {
  try {
    const profile = await Profile.create(req.body);
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
