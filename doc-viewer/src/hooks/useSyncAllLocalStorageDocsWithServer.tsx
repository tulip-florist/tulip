import { useContext, useEffect } from "react";
import { UserContext } from "../App";
import { LocalStorageAPI } from "../util/LocalStorageAPI";
import { SyncUtil } from "../util/SyncUtil";

export const useSyncAllLocalStorageDocsWithServer = () => {
  const { user } = useContext(UserContext);

  useEffect(() => {
    debugger;
    if (!user) return;

    LocalStorageAPI.getAllDocuments().then((allDocs) => {
      allDocs.forEach((it) => {
        SyncUtil.syncDocWithBackend(it);
      });
    });
  }, [user]);
};
