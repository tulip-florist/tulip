import React, { useContext, useEffect, useState } from "react";
import DocumentReader from "../DocumentReader/DocumentReader";
import FileInput from "../FileInput";
import { getFileHash } from "../../util";
import * as API from "../../util/api";
import { UserContext } from "../../App";

export const DocumentReaderView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const { user, setUser } = useContext(UserContext);

  // TODO extract into login/register component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      if (file) {
        setFileHash(await getFileHash(file));
      }
    })();
  }, [file]);

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
      setFile(file);
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
      {file && fileHash && (
        <DocumentReader fileWithHash={{ file, fileHash }} user={user} />
      )}
    </div>
  );
};
