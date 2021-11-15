import React, { useContext, useEffect, useState } from "react";
import DocumentReader from "../DocumentReader/DocumentReader";
import FileInput from "../FileInput";
import { getFileHash } from "../../util";
import * as API from "../../util/api";
import { UserContext } from "../../App";
import { FileWithHash } from "../../types/types";

export const DocumentReaderView = () => {
  const [fileWithHash, setFileWithHash] = useState<FileWithHash | null>(null);
  const { user, setUser } = useContext(UserContext);

  // TODO extract into login/register component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If JWT in local storage, get and set user
  useEffect(() => {
    // TODO implement /me endpoint
    // (async () => {
    //   const jwt = localStorage.getItem("jwt");
    //   if (jwt && !user) {
    //     const u = await API.getUser();
    //     setUser(u);
    //   }
    // })();
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
        <h1>Tulip 🌷</h1>
        <FileInput handleInputChange={handleFileInputChange} />
        {user ? (
          <p>Logged in: {user.id}</p>
        ) : (
          <div>
            <input
              placeholder="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={() => handleEmailRegister({ email, password })}>
              Register
            </button>
            <button onClick={() => handleEmailLogin({ email, password })}>
              Login
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex-grow overflow-hidden">
        {fileWithHash && (
          <DocumentReader fileWithHash={fileWithHash} user={user} />
        )}
      </div>
    </div>
  );
};
