import React, { useState } from "react";
import axios from "axios";

const PageCreator = () => {
  const [spaceKey, setSpaceKey] = useState("");
  const [pageName, setPageName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [apiTocken, setApiTocken] = useState("");
  const [jsonFile, setJsonFile] = useState(null);

  const handleFileChange = (e) => {
    setJsonFile(e.target.files[0]);
  };

  function generateTable(data) {
    const tags = data.containerVersion.tag;
    const triggers = data.containerVersion.trigger;

    function getTriggerNameById(triggerId) {
      const trigger = triggers.find(
        (trigger) => trigger.triggerId === triggerId
      );
      return trigger ? trigger.name : "Unknown Trigger";
    }

    function getEventNameFromTag(tag) {
      const eventParameter = tag.parameter.find(
        (param) => param.key === "eventName"
      );
      return eventParameter ? eventParameter.value : "None";
    }

    const tableRows = tags.map((tag) => {
      const tagName = tag.name;
      const triggerNames = tag.firingTriggerId
        .map(getTriggerNameById)
        .join(", ");
      const eventName = getEventNameFromTag(tag);

      return {
        tag: tagName,
        trigger: triggerNames,
        eventName: eventName,
      };
    });

    console.table(tableRows);
    return tableRows;
  }

  function convertToConfluenceTable(data) {
    const sortedData = data.sort((a, b) => a.tag.localeCompare(b.tag));

    const tables = {};
    sortedData.forEach((item) => {
      const groupKey = item.tag.substring(0, 2);
      if (!tables[groupKey]) {
        tables[groupKey] = [];
      }
      tables[groupKey].push(item);
    });

    const tableStrings = Object.keys(tables).map((groupKey) => {
      const headers = `<table><tr><th>Tag</th><th>Trigger</th><th>Event Name</th></tr>`;
      const rows = tables[groupKey]
        .map(
          (item) =>
            `<tr><td>${item.tag}</td><td>${item.trigger}</td><td>${item.eventName}</td></tr>`
        )
        .join("");
      const tableEnd = `</table>`;
      return headers + rows + tableEnd;
    });

    return tableStrings.join("");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reader = new FileReader();

    reader.onload = async (event) => {
      let jsonData = JSON.parse(event.target.result);
      jsonData = generateTable(jsonData);
      console.log("jsonData", jsonData);
      jsonData = convertToConfluenceTable(jsonData);
      console.log("jsonData", jsonData);
      try {
        await axios.post("http://localhost:5000/api/create-page", {
          spaceKey,
          pageName,
          jsonData,
          emailId,
          apiTocken
        });
        alert("Confluence page created successfully!");
      } catch (error) {
        console.error("Error creating Confluence page:", error);
      }
    };

    reader.readAsText(jsonFile);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="form-title">Create Confluence Page</h2>
      <input
        type="text"
        placeholder="SPACE Key"
        value={spaceKey}
        onChange={(e) => setSpaceKey(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="text"
        placeholder="Page Name"
        value={pageName}
        onChange={(e) => setPageName(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="email"
        placeholder="Lilly Email Id"
        value={emailId}
        onChange={(e) => setEmailId(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="text"
        placeholder="Atlassian API Tocken"
        value={apiTocken}
        onChange={(e) => setApiTocken(e.target.value)}
        required
        className="form-input"
      />
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        required
        className="form-file-input"
      />
      <button type="submit" className="form-button">
        Create Confluence Page
      </button>
    </form>
  );
};

export default PageCreator;
