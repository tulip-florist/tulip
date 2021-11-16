import { Doc } from "../types/types";
import { Logger } from "./logging";

const docPrefix = "doc:";
const lastSyncedPreix = "lastSyncedDoc:";

const getDocument = (hash: string): Doc | null => {
  const data = localStorage.getItem(`${docPrefix}${hash}`);
  return data ? JSON.parse(data) : null;
};

const setDocument = (doc: Doc): void => {
  localStorage.setItem(`${docPrefix}${doc.documentHash}`, JSON.stringify(doc));
  Logger.info("LocalStorageAPI, (setDocument)");
};

const getSyncedVersionOfDocument = (hash: string): Doc | null => {
  const data = localStorage.getItem(`${lastSyncedPreix}${hash}`);
  return data ? JSON.parse(data) : null;
};

const setSyncedVersionOfDocument = (doc: Doc) => {
  localStorage.setItem(
    `${lastSyncedPreix}${doc.documentHash}`,
    JSON.stringify(doc)
  );
  Logger.info("LocalStorageAPI, (setSyncedVersionOfDocument)");
};

const getAllDocuments = (): Array<Doc> => {
  const allkeys = Array(localStorage.length)
    .fill(undefined)
    .map((it, i) => localStorage.key(i))
    .filter((it) => it !== null) as Array<string>;
  const docKeys = allkeys
    .filter((it) => it.slice(0, docPrefix.length) === docPrefix)
    .map((it) => it.slice(docPrefix.length));
  const docs: Array<Doc> = docKeys.reduce((acc: Array<Doc>, it: string) => {
    const doc = getDocument(it);
    if (doc) {
      return [...acc, doc];
    } else {
      return acc;
    }
  }, []);

  Logger.info(`(getAllDocuments), :num of docs: ${docs.length}`);
  return docs;
};

const setAuth = (token: string) => {
  localStorage.setItem("auth", token);
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
