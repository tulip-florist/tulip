import { Doc, User } from "../types/types";
import axios from "./axios";

export const getUser = async (): Promise<User> => {
  const res = await axios.get("/auth/me");
  return res.data.user;
};

export const emailRegister = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> => {
  try {
    await axios.post("/auth/emailSignup", { email, password });
  } catch (error) {
    console.log((error as Error).message);
  }
};

export const emailLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> => {
  const res = await axios.post("/auth/emailSignin", { email, password });
  const user: User = {
    id: res.data.userId,
  };
  return user;
};

export const getDocument = async (
  documentHash: Doc["documentHash"]
): Promise<Doc | null> => {
  try {
    const res = await axios.get("/document/getByHash", {
      params: { documentHash },
    });
    return res.data;
  } catch (e) {
    return null;
  }
};

export const setDocument = async (document: Doc) => {
  await axios.put("/document/setByHash", {
    document,
  });
};
