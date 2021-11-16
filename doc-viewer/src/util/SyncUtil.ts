import { mergeDocs } from ".";
import { Doc } from "../types/types";
import { LocalStorageAPI } from "./LocalStorageAPI";
import { Logger } from "./logging";
import * as API from "./api"

const syncDocWithBackend = async (doc: Doc): Promise<Doc> => {
    let ancestor = LocalStorageAPI.getSyncedVersionOfDocument(doc.documentHash);
    const upstream = await API.getDocument(doc.documentHash);
  
    const mergedDoc = mergeDocs({
      ancestor: ancestor || undefined,
      upstream: upstream || undefined,
      local: doc,
    });
  
    await API.setDocument(mergedDoc);
    Logger.info(
      "(syncDocWithBackend),:set local and server version to merged doc",
      { numAnnotations: mergedDoc.annotations.length }
    );
    LocalStorageAPI.setDocument(mergedDoc);
    LocalStorageAPI.setSyncedVersionOfDocument(mergedDoc);
    return mergedDoc;
  };
  
  export const SyncUtil = { syncDocWithBackend };