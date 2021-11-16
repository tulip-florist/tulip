import { Doc } from "../types/types";
import { Logger } from "./logging";
import localforage from "localforage";

localforage.config({
  driver: localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name: "tulip",
  version: 1.0,
  size: 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName: "tulip_docs", // Should be alphanumeric, with underscores.
  description: "Applictation data for Tulip data",
});

const docPrefix = "doc:";
const lastSyncedPreix = "lastSyncedDoc:";

const getDocument = async (hash: string): Promise<Doc | null> => {
  const data = (await localforage.getItem(`${docPrefix}${hash}`)) as string;
  return data ? JSON.parse(data) : null;
};

const setDocument = async (doc: Doc) => {
  localforage.setItem(`${docPrefix}${doc.documentHash}`, JSON.stringify(doc));
  Logger.info("LocalStorageAPI, (setDocument)");
};

const getSyncedVersionOfDocument = async (
  hash: string
): Promise<Doc | null> => {
  const data = (await localforage.getItem(
    `${lastSyncedPreix}${hash}`
  )) as string;
  return data ? JSON.parse(data) : null;
};

const setSyncedVersionOfDocument = async (doc: Doc) => {
  localforage.setItem(
    `${lastSyncedPreix}${doc.documentHash}`,
    JSON.stringify(doc)
  );
  Logger.info("LocalStorageAPI, (setSyncedVersionOfDocument)");
};

const getAllDocuments = async (): Promise<Array<Doc>> => {
  let docs: Array<Doc> = [];
  localforage.iterate<string, void>((value, key, i) => {
    debugger;
    if (key.slice(0, docPrefix.length) === docPrefix) {
      debugger;
      docs.push(JSON.parse(value) as Doc);
    }
  });

  Logger.info(`(getAllDocuments), :num of docs: ${docs.length}`);
  return docs;
};

const setAuth = async (token: string) => {
  localforage.setItem("auth", token);
  Logger.info("LocalStorageAPI, (setAuth)");
};

const getAuth = (): string | null => {
  return localStorage.getItem("auth");
};

const removeAuth = (): void => {
  localStorage.removeItem("auth");
};

export const LocalStorageAPI = {
  getDocument,
  setDocument,
  getSyncedVersionOfDocument,
  setSyncedVersionOfDocument,
  getAllDocuments,
  getAuth,
  setAuth,
  removeAuth,
};
