import axios from "axios";

const defaultOptions = {
  // baseURL: "http://localhost:8081",
  // baseURL: "http://192.168.43.2:8081",
  baseURL: "https://finbook-version-2.herokuapp.com",
  headers: {
    "Content-Type": "application/json",
  },
};

const instance = axios.create(defaultOptions);

instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

export default instance;
