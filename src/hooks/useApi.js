import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-estoque-8boj.onrender.com"
});

// 🔐 adiciona token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function useApi() {
  async function get(url) {
    const res = await api.get(url);
    return res.data;
  }

  async function post(url, data) {
    const res = await api.post(url, data);
    return res.data;
  }

  async function put(url, data) {
    const res = await api.put(url, data);
    return res.data;
  }

  async function del(url) {
    const res = await api.delete(url);
    return res.data;
  }

  return { get, post, put, del };
}
