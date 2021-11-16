import React, { useCallback, useContext, useEffect, useState } from "react";
import DocumentReader from "../DocumentReader/DocumentReader";
import FileInput from "../FileInput";
import { getFileHash } from "../../util";
import * as API from "../../util/api";
import { UserContext } from "../../App";
import { FileWithHash } from "../../types/types";
import { Logger } from "../../util/logging";
import { NavBar } from "../NavBar";
import { UserProfile } from "../UserProfile";
import { EmailLoginRegister } from "../EmailLoginRegister";
import { useUserLogout } from "../../hooks";
import { useDropzone } from "react-dropzone";
import { LocalStorageAPI } from "../../util/LocalStorageAPI";
import { useSyncAllLocalStorageDocsWithServer } from "../../hooks/useSyncAllLocalStorageDocsWithServer";

export const DocumentReaderView = () => {
  const [fileWithHash, setFileWithHash] = useState<FileWithHash | null>(null);
  const { user, setUser } = useContext(UserContext);
  const handleLogout = useUserLogout();

  useSyncAllLocalStorageDocsWithServer();

  const onDrop = useCallback(async (files) => {
    const file = files?.[0] || null;
    if (file) {
      setFileWithHash({ file, fileHash: await getFileHash(file) });
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // If JWT in local storage, get and set user
  useEffect(() => {
    (async () => {
      const jwt = await LocalStorageAPI.getAuth();

      if (jwt && !user) {
        Logger.info(
          "DocumentReaderView,(useEffect),:fetching user from local jwt"
        );
        const fetchedUser = await API.getUser();
        setUser(fetchedUser);
      }
    })();
  }, [setUser, user]);

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
    <div className="h-full w-full flex flex-col">
      <div className="w-full flex-initial">
        <NavBar>
          <div className="flex justify-between">
            <div>
              <span>Tulip 🌷</span>
              <span className="text-gray-400 ml-1 mr-2">|</span>
              <FileInput
                value={fileWithHash?.file}
                handleInputChange={handleFileInputChange}
              />
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
      </div>

      <div
        className="w-full flex-grow overflow-hidden relative"
        {...getRootProps()}
      >
        {isDragActive && (
          <div className="bg-gray-800 bg-opacity-50 w-full h-full flex justify-center items-center cursor-pointer z-10 absolute">
            <div className="bg-white p-4 rounded-sm">
              <p className="text-xl text-gray-600">
                Drag 'n' drop a <span className="font-bold">PDF</span> or{" "}
                <span className="font-bold">EPUB</span> document here
              </p>
            </div>
          </div>
        )}
        {fileWithHash ? (
          <DocumentReader
            fileWithHash={fileWithHash}
            user={user}
            key={fileWithHash.fileHash}
          />
        ) : (
          <div className="w-full h-full flex justify-center items-center cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-xl text-gray-600">
              Drag 'n' drop a <span className="font-bold">PDF</span> or{" "}
              <span className="font-bold">EPUB</span> document here, or click to
              select
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
