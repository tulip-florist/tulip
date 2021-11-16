import { useContext } from "react";
import { UserContext } from "../App";
import { LocalStorageAPI } from "../util/LocalStorageAPI";

export const useUserLogout = () => {
  const { setUser } = useContext(UserContext);
  return () => {
    setUser(null);
    LocalStorageAPI.removeAuth();
  };
};
