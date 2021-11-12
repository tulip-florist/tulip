import Axios from "axios";

const axios = Axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use((res) => {
  const auth = res.headers["authorization"];
  if (auth) {
    const localAuth = localStorage.getItem("jwt");
    if (localAuth !== auth) {
      localStorage.setItem("jwt", auth);
    }
  }
  return res;
});

export default axios;
