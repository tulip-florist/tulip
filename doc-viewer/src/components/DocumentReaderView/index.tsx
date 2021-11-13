import React, { useContext, useEffect, useState } from "react";
import DocumentReader from "../DocumentReader/DocumentReader";
import FileInput from "../FileInput";
import { getFileHash, LocalStorageAPI, SyncUtil } from "../../util";
import * as API from "../../util/api";
import { UserContext } from "../../App";
import { FileWithHash } from "../../types/types";
import { Logger } from "../../util/logging";
import { NavBar } from "../NavBar";
import { UserProfile } from "../UserProfile";
import { EmailLoginRegister } from "../EmailLoginRegister";
import { useUserLogout } from "../../hooks";

export const DocumentReaderView = () => {
  const [fileWithHash, setFileWithHash] = useState<FileWithHash | null>(null);
  const { user, setUser } = useContext(UserContext);
  const handleLogout = useUserLogout();

  // If JWT in local storage, get and set user
  useEffect(() => {
    (async () => {
      const jwt = LocalStorageAPI.getAuth();

      if (jwt && !user) {
        Logger.info(
          "DocumentReaderView,(useEffect),:fetching user from local jwt"
        );
        const fetchedUser = await API.getUser();
        setUser(fetchedUser);
      }
    })();
  }, [setUser, user]);

  // Sync all local documents with the server (merge)
  // Use case: User made local changes to different files, and all should be synced when use logs in / goes online
  // useEffect(() => {
  //   if (!user) return;

  //   const localDocs = LocalStorageAPI.getAllDocuments();
  //   localDocs.forEach((it) => {
  //     SyncUtil.syncDocWithBackend(it);
  //   });
  // }, [user]);

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { files } = event.target;
    const file = files?.[0] || null;
    if (file) {
      setFileWithHash({ file, fileHash: await getFileHash(file) });
    }
  };

  const handleEmailRegister = async (payload: {
    email: string;
    password: string;
  }) => {
    try {
      await API.emailRegister(payload);
      handleEmailLogin(payload);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEmailLogin = async (payload: {
    email: string;
    password: string;
  }) => {
    const user = await API.emailLogin(payload);
    setUser(user);
  };

  return (
    <div>
      <NavBar>
        <div className="flex justify-between">
          <div>
            <span>Tulip 🌷</span>
            <span className="text-gray-400 ml-1 mr-2">|</span>
            <FileInput handleInputChange={handleFileInputChange} />
          </div>
          <div>
            {user ? (
              <UserProfile user={user} onLogout={handleLogout} />
            ) : (
              <EmailLoginRegister
                onLogin={handleEmailLogin}
                onRegister={handleEmailRegister}
              />
            )}
          </div>
        </div>
      </NavBar>

      {fileWithHash ? (
        <DocumentReader fileWithHash={fileWithHash} user={user} />
      ) : (
        <h1>Open file</h1>
      )}
    </div>
  );
};
