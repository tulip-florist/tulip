import { compareDocs, mergeDocs } from "..";
import { Doc } from "../../types/types";
import { LocalStorageAPI } from "../LocalStorageAPI";
import { Logger } from "../logging";
import * as API from "../api"

const syncDocWithBackend = async (doc: Doc): Promise<Doc> => {
    let ancestor = await LocalStorageAPI.getSyncedVersionOfDocument(doc.documentHash);
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
    await LocalStorageAPI.setDocument(mergedDoc);
    await LocalStorageAPI.setSyncedVersionOfDocument(mergedDoc);
    return mergedDoc;
  };

const isDocSynced = async (doc: Doc): Promise<boolean> => {
    const currentDoc = await LocalStorageAPI.getDocument(doc.documentHash)
    const lastSyncedDoc = await LocalStorageAPI.getSyncedVersionOfDocument(doc.documentHash)

    if (!currentDoc || !lastSyncedDoc) return false

    if (!compareDocs(doc, currentDoc)) return false

    return compareDocs(currentDoc, lastSyncedDoc)
}
  
  export const SyncUtil = { syncDocWithBackend, isDocSynced };