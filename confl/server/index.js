import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());
app.use(bodyParser.json());

app.post("/api/create-page", async (req, res) => {
  const { spaceKey, pageName, jsonData, emailId, apiTocken } = req.body;
  console.log("jsondata", jsonData);
  let spaceId = "";
  await fetch(`https://lilly-confluence.atlassian.net/wiki/rest/api/space/${spaceKey}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${emailId}:${apiTocken}`
      ).toString("base64")}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    }
  })
    .then(async (response) => {
      console.log(`IssueId Response: ${response.status} ${response.statusText}`);
      let ress = await response.text();
      spaceId = JSON.parse(ress)?.id;
      return response.text();
    })
    .then((text) => spaceId = text?.id)
    .catch((err) => console.error(err));

  console.log("spaceId", spaceId);
  const bodyData = `{
        "spaceId": ${spaceId},
        "status": "current",
        "title": ${'"' + pageName + '"'},
        "body": {
            "representation": "storage",
            "value": "${jsonData}"
        }
        }`;
  console.log("bodyData", bodyData);
  await fetch("https://lilly-confluence.atlassian.net/wiki/api/v2/pages", { 
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${emailId}:${apiTocken}`
      ).toString("base64")}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: bodyData,
  })
    .then((response) => {
      console.log(`Response: ${response.status} ${response.statusText}`);
      return response.text();
    })
    .then((text) => console.log(text))
    .catch((err) => console.error(err));

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
