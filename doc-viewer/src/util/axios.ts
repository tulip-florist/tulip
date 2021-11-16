import Axios from "axios";
import { LocalStorageAPI } from "./LocalStorageAPI";

const axios = Axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axios.interceptors.request.use((config) => {
  const localAuth = LocalStorageAPI.getAuth()

  if (localAuth && config.headers) {
    config.headers.Authorization = `Bearer ${localAuth}`;
  }

  return config;
});

axios.interceptors.response.use((res) => {
  const auth = res.headers["authorization"];
  if (auth) {
    const localAuth = LocalStorageAPI.getAuth()
    if (localAuth !== auth) {
      LocalStorageAPI.setAuth(auth)
    }
  }
  return res;
});

export default axios;
