// import { Model, createKey } from "@blink-mind/core";
import { Model, createKey } from "../packages/core/lib/main";
import { act } from "react-dom/test-utils";


export const downloadFile = (url, filename) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

export function generateSimpleModel(activeWSProject, workspaces = []) {
  const rootKey = createKey();

  let obj = {
    rootTopicKey: rootKey,
    topics: [
      {
        key: rootKey,
        blocks: [{ type: "CONTENT", data: "MainTopic" }]
      }
    ],
    properties: {
      title: {
        quillText: "MainTopic"
      }
    }
  };

  let foundWs;
  // console.log("inside geterante simple model", activeWSProject)
  if (typeof activeWSProject == "string") {
    foundWs = workspaces.filter(ws => ws._id == activeWSProject._id);
    if (foundWs.length == 1) {
      if (foundWs[0] && foundWs[0].map && Object.keys(foundWs[0].map).length > 0) {
        obj = foundWs[0].map;
      }
    }
  } else if (typeof activeWSProject == "object" && activeWSProject.map) {
    obj = activeWSProject.map;
  }

  // console.log("obj", obj)

  return Model.create(obj);
}
