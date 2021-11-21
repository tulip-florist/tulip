import { Doc, User } from "../types/types";
import axios from "./axios";

export const getUser = async (): Promise<User> => {
  const res = await axios.get("/auth/me", {
    validateStatus: (status) => {
      return (status >= 200 && status < 300) || status === 401;
    },
  });
  if (res.status === 401) {
    throw new Error("Session expired, please login again");
  }
  return res.data.user;
};

export const emailRegister = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  const response = await axios.post(
    "/auth/emailSignup",
    { email, password },
    {
      validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 409;
      },
    }
  );
  if (response.status === 409) {
    throw new Error("Email already registered!");
  }
};

export const emailLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  const res = await axios.post(
    "/auth/emailSignin",
    { email, password },
    {
      validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 401;
      },
    }
  );
  if (res.status === 401) {
    throw new Error("Invalid email or password");
  }
};

export const getDocument = async (
  documentHash: Doc["documentHash"]
): Promise<Doc | null> => {
  const res = await axios.get(`/documents/${documentHash}`, {
    validateStatus: function (status) {
      return (status >= 200 && status < 300) || status === 404;
    },
  });
  return res.status === 404 ? null : res.data;
};

export const setDocument = async (document: Doc) => {
  await axios.put(`documents/${document.documentHash}`, {
    document,
  });
};
