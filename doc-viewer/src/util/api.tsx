import { Doc, User } from "../types/types";
import axios from "./axios";

export const getUser = async (): Promise<User> => {
  return new Promise((resolve) => resolve({ id: "test id" }));
};

export const emailRegister = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> => {
  return new Promise((resolve) => resolve({ id: "test user id" }));
};

export const emailLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> => {
  return new Promise((resolve) => resolve({ id: "asdf" }));
};

export const getDocument = async ({
  hash,
}: {
  hash: string;
}): Promise<Doc | null> => {
  return new Promise((resolve) => {
    const doc = {
      id: "asdf",
      hash: "test hash",
      annotations: [
        {
          color: "asdf",
          highlight: "asdf",
          id: "asdf",
          position: "asdf",
          note: "asdf",
        },
      ],
    };
    resolve(doc);
  });
};

export const setDocument = async (doc: Doc): Promise<void> => {};
