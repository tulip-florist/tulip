import { AxiosResponse } from "axios";
import { Doc, User } from "../types/types";
import axios from "./axios";

export const getUser = async (): Promise<User | null> => {
  const user = await axios.get("/auth/me").then((res) => res.data.user);
  return user;
};

export const emailRegister = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  await axios
    .post("/auth/emailRegister", { email, password })
    .catch((error) => {
      if (error.response.status === 409) {
        throw new Error("Email already registered!");
      }
    });
};

export const emailLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  await axios.post("/auth/emailLogin", { email, password }).catch((error) => {
    if (error.response.status === 403 || error.response.status === 404) {
      throw new Error("Invalid email or password");
    }
  });
};

export const logOut = async (): Promise<AxiosResponse> => {
  return await axios.post("/auth/logout");
};

export const refreshToken = async () => {
  await axios.post("/auth/token");
};

export const getDocument = async (
  documentHash: Doc["documentHash"]
): Promise<Doc | null> => {
  const document = await axios
    .get(`/documents/${documentHash}`)
    .then((res) => res.data)
    .catch((error) => {
      if (error.response.status === 404) {
        return null;
      } else {
        throw error;
      }
    });
  return document;
};

export const setDocument = async (document: Doc): Promise<Doc> => {
  const updatedDocument = await axios
    .put(`documents/${document.documentHash}`, {
      document,
    })
    .then((res) => res.data);
  return updatedDocument;
};
