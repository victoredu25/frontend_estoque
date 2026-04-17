const BASE_URL = "http://localhost:3000";

export function useApi() {
  async function get(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    return await res.json();
  }

  async function post(endpoint, data) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    return await res.json();
  }

  return { get, post };
}