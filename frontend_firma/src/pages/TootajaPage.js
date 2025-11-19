import LogoutButton from "../components/LogoutButton";
import { useEffect, useState, useContext } from "react";
import { apiGet, apiPut, apiPost } from "../api/api";
import { AuthContext } from "../auth/AuthContext";

export default function TootajaPage() {
  const { name } = useContext(AuthContext); // praegune kasutaja
  const [userData, setUserData] = useState({ nimi: "", isikukood: "", amet: "", tunnitasu: 0, email: "" });
  const [worktimes, setWorktimes] = useState([]);
  const [newWorktime, setNewWorktime] = useState({ Kuupaev: "", Sissepaas: "", Valjapaas: "" });

  useEffect(() => {
    loadUserData();
    loadWorktimes();
  }, []);

  // Kasutaja andmete laadimine
  const loadUserData = async () => {
    try {
      const data = await apiGet(`/api/tootaja/Tootajate/${name}`);
      setUserData(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  // Uuenda Valjapaas (väljalogimise aeg)
  const updateValjapaas = async (kuupaev) => {
  let uusValjapaas = prompt("Sisesta väljapääsu aeg (HH:mm):");
  if (!uusValjapaas) return;

  // добавляем секунды, если их нет
  if (!uusValjapaas.includes(":")) return alert("Vale formaat!");
  if (uusValjapaas.split(":").length === 2) {
      uusValjapaas = uusValjapaas + ":00";
  }

  const kuupaevISO = kuupaev.split('.').reverse().join('-'); // формат yyyy-MM-dd

  try {
    await apiPut(
      `/api/Worktime/valjapaas/${name}/${kuupaevISO}`,
      JSON.stringify({ Valjapaas: uusValjapaas }) // <-- объект DTO
    );
    alert("Väljalogimise aeg uuendatud!");
    loadWorktimes();
  } catch (err) {
    alert(err.message);
  }
};







  // Kasutaja tööaja laadimine
  const loadWorktimes = async () => {
    try {
      const data = await apiGet(`/api/Worktime/tootaja/${name}`);

      // Muundame kuupäevad ja kellaajad kuvamiseks ning säilitame ISO kuupäeva edasiseks kasutamiseks
      const formattedWorktimes = data?.worktimes?.map(w => ({
        RawKuupaev: w.kuupaev,  // ISO kuupäev, mida kasutada API päringutes
        Kuupaev: w.kuupaev ? new Date(w.kuupaev).toLocaleDateString() : "-",
        Sissepaas: w.sissepaas ? w.sissepaas.slice(0, 5) : "-",
        Valjapaas: w.valjapaas ? w.valjapaas.slice(0, 5) : "Pole",
        Palk: w.palk != null ? Number(w.palk) : 0
      })) || [];

      setWorktimes(formattedWorktimes);
    } catch (err) {
      console.error(err);
      setWorktimes([]);
    }
  };

  // Kasutaja andmete uuendamine (ainult nimi ja e-post)
  const updateUserData = async () => {
    try {
      await apiPut(`/api/tootaja/Tootajate/${name}`, userData);
      alert("Andmed uuendatud!");
      loadUserData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Tööaja lisamine
  const addWorktime = async () => {
    try {
      if (!newWorktime.Kuupaev || !newWorktime.Sissepaas) {
        alert("Täida kõik kohustuslikud väljad (kuupäev ja sissepääs)");
        return;
      }

      // Kui väljal Valjapaas on tühi string või "Pole", siis saadame null
      const valjapaasForSend = !newWorktime.Valjapaas || newWorktime.Valjapaas.toLowerCase() === "pole"
        ? null
        : newWorktime.Valjapaas;

      // Kuupäeva väärtus peab olema ISO formaadis 'YYYY-MM-DD', kuna input type="date" annab selle formaadi
      const worktimeToSend = {
        Kuupaev: newWorktime.Kuupaev,
        Sissepaas: newWorktime.Sissepaas,
        Valjapaas: valjapaasForSend
      };

      await apiPost(`/api/Worktime/tootaja/lisada/${name}`, worktimeToSend);
      alert("Tööaeg lisatud!");
      setNewWorktime({ Kuupaev: "", Sissepaas: "", Valjapaas: "" });
      loadWorktimes();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={page}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={title}>Tere, {userData.nimi}! Minu andmed ja tööajad</h1>
        <LogoutButton />
      </header>

      {/* === Minu andmed === */}
      <section style={section}>
        <h2 style={sectionTitle}>Minu andmed</h2>
        <div style={formGrid}>
          <input
            style={input}
            type="text"
            placeholder="Nimi"
            value={userData.nimi}
            onChange={(e) => setUserData({ ...userData, nimi: e.target.value })}
          />
          <input style={input} type="text" placeholder="Isikukood" value={userData.isikukood} disabled />
          <input style={input} type="text" placeholder="Amet" value={userData.amet} disabled />
          <input style={input} type="number" placeholder="Tunnitasu" value={userData.tunnitasu} disabled />
          <input
            style={input}
            type="email"
            placeholder="Email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
        </div>
        <button style={btnMain} onClick={updateUserData}>
          Salvesta
        </button>
      </section>

      {/* === Lisa tööaeg === */}
      <section style={section}>
        <h2 style={sectionTitle}>Lisa tööaeg</h2>
        <div style={formGrid}>
          <input
            style={input}
            type="date"
            value={newWorktime.Kuupaev}
            onChange={(e) => setNewWorktime({ ...newWorktime, Kuupaev: e.target.value })}
          />
          <input
            style={input}
            type="time"
            value={newWorktime.Sissepaas}
            onChange={(e) => setNewWorktime({ ...newWorktime, Sissepaas: e.target.value })}
          />
          <input
            style={input}
            type="time"
            value={newWorktime.Valjapaas}
            onChange={(e) => setNewWorktime({ ...newWorktime, Valjapaas: e.target.value })}
          />
        </div>
        <button style={btnMain} onClick={addWorktime}>
          Lisa
        </button>
      </section>

      {/* === Minu tööajad таблица === */}
      <section style={section}>
        <h2 style={sectionTitle}>Minu tööajad</h2>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>Kuupäev</th>
              <th style={th}>Sisse</th>
              <th style={th}>Välja</th>
              <th style={th}>Palk (€)</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {worktimes?.map((w, i) => (
              <tr key={i} style={tr}>
                <td style={td}>{w.Kuupaev}</td>
                <td style={td}>{w.Sissepaas}</td>
                <td style={td}>{w.Valjapaas}</td>
                <td style={td}>{w.Palk?.toFixed(2)}</td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => updateValjapaas(w.RawKuupaev)}>
                    Muuda
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

const btnEdit = { 
  padding: "6px 12px",
  background: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};
const page = { 
    padding: "20px", 
    fontFamily: "Arial, sans-serif", 
    background: "#f8f8f8" 
};
const title = { 
    textAlign: "center", 
    marginBottom: "30px" 
};
const section = { 
    background: "white", 
    padding: "20px", 
    marginBottom: "30px", 
    borderRadius: "8px", 
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
};
const sectionTitle = { 
    marginBottom: "15px" 
};
const formGrid = { 
    display: "grid", 
    gridTemplateColumns: "repeat(3, 1fr)", 
    gap: "10px", 
    marginBottom: "10px" 
};
const input = { 
    padding: "8px", 
    borderRadius: "4px", 
    border: "1px solid #ccc" 
};
const table = { 
    width: "100%", 
    borderCollapse: "collapse", 
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
};
const theadRow = { 
    background: "#4CAF50", 
    color: "white" 
};
const th = { 
    padding: "10px", 
    border: "1px solid #ddd", 
    textAlign: "center" 
};
const tr = { 
    background: "#fff", 
    borderBottom: "1px solid #ddd" 
};
const td = { 
    padding: "8px", 
    border: "1px solid #ddd", 
    textAlign: "center" 
};
const btnMain = { 
    padding: "8px 16px", 
    background: "#4CAF50", 
    color: "white", 
    border: "none", 
    borderRadius: "4px", 
    cursor: "pointer" 
};
