import Axios from "axios";

const axios = Axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use((res) => {
  const auth = res.headers["Authorization"];
  if (auth) {
    const localAuth = localStorage.getItem("jwt");
    if (localAuth !== auth) {
      localStorage.setItem("jwt", auth);
    }
  }
});

export default axios;
