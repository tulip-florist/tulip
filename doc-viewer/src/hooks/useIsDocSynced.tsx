import { useEffect, useRef, useState } from "react";
import {
  checkIsSynced,
  Forage,
  LocalStorageDoc,
} from "../util/LocalStorageAPI";

// Returns false if the document is not in local storage,
// there is no last synced entry, or the last synced entry
// is different than the current document

export const useIsDocSynced = (hash: string) => {
  const [isSynced, setIsSynced] = useState<boolean | null>(null);
  const subscriptionRef = useRef<Subscription>();

  useEffect(() => {
    Forage.ready().then(() => {
      const obs = Forage.getItemObservable(hash);
      const sub = obs.subscribe({
        next: function (doc) {
          const status = checkIsSynced(doc as LocalStorageDoc | null);
          setIsSynced(status);
        },
        error: function (err) {
          console.log("Found an error!", err);
        },
        complete: function () {
          console.log("Observable destroyed!");
        },
      });
      subscriptionRef.current = sub;
    });

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [hash]);

  return isSynced;
};
