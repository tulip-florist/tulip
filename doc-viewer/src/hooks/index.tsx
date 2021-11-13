import { useContext } from "react";
import { UserContext } from "../App";
import { LocalStorageAPI } from "../util";

export const useUserLogout = () => {
  const { setUser } = useContext(UserContext);
  return () => {
    setUser(null);
    LocalStorageAPI.removeAuth();
  };
};
