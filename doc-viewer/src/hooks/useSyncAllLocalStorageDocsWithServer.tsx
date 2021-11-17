import { useContext, useEffect } from "react";
import { UserContext } from "../App";
import { LocalStorageAPI } from "../util/LocalStorageAPI";
import { SyncUtil } from "../util/sync/SyncUtil";

export const useSyncAllLocalStorageDocsWithServer = () => {
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) return;

    LocalStorageAPI.getAllDocuments().then((allDocs) => {
      allDocs.forEach((it) => {
        SyncUtil.syncDocWithBackend(it);
      });
    });
  }, [user]);
};
