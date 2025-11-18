const BASE_URL = "https://localhost:7150";

export async function apiGet(url) {
  const token = localStorage.getItem("token"); // saame JWT-tokeni localStorage'ist

  const res = await fetch(BASE_URL + url, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function apiPost(url, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function apiPut(url, body) {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + url, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function apiDelete(url) {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + url, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
