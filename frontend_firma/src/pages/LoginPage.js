import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [parool, setParool] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://localhost:7150/api/Login/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, parool })
      });

      if (!res.ok) {
        const text = await res.text();
        alert("Login failed: " + text);
        return;
      }

      const data = await res.json();
      login(data.token, data.role, data.name);

      if (data.role === "Admin") navigate("/admin");
      else navigate("/tootaja");

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Cannot connect to server");
    }
  };

  return (
    <div style={container}>
      <form onSubmit={submit} style={form}>
        <h2 style={title}>Logi sisse</h2>
        <input
          style={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          style={input}
          value={parool}
          onChange={(e) => setParool(e.target.value)}
          placeholder="Parool"
          type="password"
        />
        <button type="submit" style={btn}>Sisene</button>
      </form>
    </div>
  );
}
const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f0f2f5",
  fontFamily: "Arial, sans-serif"
};

const form = {
  display: "flex",
  flexDirection: "column",
  padding: "40px",
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  minWidth: "320px"
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#333"
};

const input = {
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "16px"
};

const btn = {
  padding: "10px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px"
};
