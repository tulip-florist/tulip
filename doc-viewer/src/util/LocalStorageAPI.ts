import { Doc } from "../types/types";
import { Logger } from "./logging";
import localforage from "localforage";
import "localforage-observable";
import { Observable } from "rxjs";
import { compareDocs } from ".";

export interface LocalStorageDoc {
  currentDoc?: Doc;
  lastSyncedDoc?: Doc;
}

localforage.config({
  driver: localforage.INDEXEDDB, // Force WebSQL; same as using setDriver()
  name: "tulip",
  version: 1.0,
  storeName: "tulip_docs", // Should be alphanumeric, with underscores.
  description: "Applictation data for Tulip user data",
});

localforage.newObservable.factory = function (subscribeFn) {
  return new Observable(subscribeFn);
};

const getDocument = async (hash: string): Promise<Doc | null> => {
  const storedDoc = await localforage.getItem<LocalStorageDoc>(hash);
  return storedDoc?.currentDoc || null;
};

const setDocument = async (doc: Doc) => {
  const savedDoc = await localforage.getItem<LocalStorageDoc>(doc.documentHash);
  const updatedDoc: LocalStorageDoc = { ...savedDoc, currentDoc: doc };
  await localforage.setItem(doc.documentHash, updatedDoc);
  Logger.info("LocalStorageAPI, (setDocument)");
};

const getSyncedVersionOfDocument = async (
  hash: string
): Promise<Doc | null> => {
  const storedDoc = await localforage.getItem<LocalStorageDoc>(hash);
  return storedDoc?.lastSyncedDoc || null;
};

const setSyncedVersionOfDocument = async (doc: Doc) => {
  const storedDoc = await localforage.getItem<LocalStorageDoc>(
    doc.documentHash
  );
  const updatedDoc: LocalStorageDoc = { ...storedDoc, lastSyncedDoc: doc };
  await localforage.setItem(doc.documentHash, updatedDoc);
  Logger.info("LocalStorageAPI, (setSyncedVersionOfDocument)");
};

const getAllDocuments = async (): Promise<Array<Doc>> => {
  let allSavedDocs: Array<LocalStorageDoc> = [];
  localforage.iterate<LocalStorageDoc, void>((value, key, i) => {
    allSavedDocs = [...allSavedDocs, value];
  });

  const docs = allSavedDocs
    .map((it) => it?.currentDoc)
    .filter((it) => Boolean(it)) as Array<Doc>;
  Logger.info(`(getAllDocuments), :num of docs: ${docs.length}`);
  return docs;
};

const setAuth = async (token: string) => {
  localStorage.setItem("auth", token);
  Logger.info("LocalStorageAPI, (setAuth)");
};

const getAuth = (): string | null => {
  return localStorage.getItem("auth");
};

const removeAuth = (): void => {
  localStorage.removeItem("auth");
};

export const checkIsSynced = (
  props: LocalStorageDoc | null
): boolean | null => {
  if (props === null) return null;
  const { currentDoc, lastSyncedDoc } = props;
  return compareDocs(currentDoc, lastSyncedDoc);
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

export const Forage = localforage;
