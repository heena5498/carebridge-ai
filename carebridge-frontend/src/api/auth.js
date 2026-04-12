import client from "./client";

export async function loginUser({ email, password }) {
  const { data } = await client.post("/auth/login", { email, password });
  return data;
}

export async function registerUser({ full_name, email, password, role }) {
  const { data } = await client.post("/auth/register", { full_name, email, password, role });
  return data;
}
