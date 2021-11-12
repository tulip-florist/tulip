import React, { useContext, useEffect, useMemo, useState } from "react";
import DocumentReader from "../DocumentReader/DocumentReader";
import FileInput from "../FileInput";
import { getFileHash } from "../../util";
import * as API from "../../util/api";
import { UserContext } from "../../App";

export const DocumentReaderView = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    (async () => {
      if (file) {
        setFileHash(await getFileHash(file));
      }
    })();
  }, [file]);

  // If JWT in local storage, get and set user
  useEffect(() => {
    (async () => {
      const jwt = localStorage.getItem("jwt");

      if (!jwt) return;

      // API get user
      const user = await API.getUser();

      setUser(user);
    })();
  }, [setUser]);

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
    const user = await API.emailRegister(payload);
    setUser(user);
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
        <EmailForm
          onLogin={handleEmailLogin}
          onRegister={handleEmailRegister}
        />
      )}
      {file && fileHash && <DocumentReader fileWithHash={{ file, fileHash }} />}
    </div>
  );
};

export const EmailForm = ({
  onLogin,
  onRegister,
}: {
  onLogin: (args: { email: string; password: string }) => void;
  onRegister: (args: { email: string; password: string }) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <form>
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
        <button onClick={() => onRegister({ email, password })}>
          Register
        </button>
        <button onClick={() => onLogin({ email, password })}>Login</button>
      </form>
    </div>
  );
};
