const express = require("express");
const { getSSMData } = require("./ssm");

const port = 3000;
const app = express();

app.get('/', async (req, res) => {
  res.json({
    "app": "aws-cross-account-ssm-access",
    "endpoints": [
      "/get-ssm-data"
    ]
  });
})

app.get('/get-ssm-data', async (req, res) => {
  const response = await getSSMData();

  res.json(response);
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
