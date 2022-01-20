import Axios from "axios";
import { refreshToken } from "./api";

const axios = Axios.create({
  withCredentials: true,
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axios.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response) {
      const errStatus = err.response.status;
      const errUrl = err.response.config.url;

      if (errUrl === "/auth/token" || errUrl === "/auth/logout") {
        if (errStatus === 400) {
          return Promise.reject(new Error("refresh_token missing"));
        } else if (errStatus === 500) {
          return Promise.reject(new Error("refresh_token reused"));
        } else if (errStatus === 401 && errUrl === "/auth/token") {
          return Promise.reject(new Error("refresh_token expired"));
        } else if (errStatus === 401 && errUrl === "/auth/logout") {
          return Promise.reject();
        }
      }

      if (
        !originalConfig._retry &&
        (errStatus === 401 || errStatus === 400) &&
        !(errUrl === "/auth/emailLogin" || errUrl === "/auth/emailRegister")
      ) {
        originalConfig._retry = true;
        try {
          await refreshToken();
          return axios(originalConfig); // retry original request
        } catch (err) {
          return Promise.reject(err);
        }
      }

      if (errStatus === 500) {
        return Promise.reject(new Error("Something went wrong"));
      }
    }

    return Promise.reject(err);
  }
);

export default axios;
