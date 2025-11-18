import LogoutButton from "../components/LogoutButton";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api/api";

export default function AdminPage() {
  const [tootajad, setTootajad] = useState([]);
  const [nimiOtsing, setNimiOtsing] = useState("");
  const [ametOtsing, setAmetOtsing] = useState("");
  const [sortOrder, setSortOrder] = useState(""); 
  const [uueTootaja, setUueTootaja] = useState({
    nimi: "",
    isikukood: "",
    amet: "",
    tunnitasu: 0,
    email: "",
    parool: ""
  });

  const [dailyReportDate, setDailyReportDate] = useState("");
  const [dailyReport, setDailyReport] = useState([]);
  const [salaryReport, setSalaryReport] = useState([]);

  // filter ja sorteerimine
  const loadAll = async () => {
    let query = "/api/admin/AdminTootajate?";
    if (nimiOtsing) query += `nimi=${encodeURIComponent(nimiOtsing)}&`;
    if (ametOtsing) query += `amet=${encodeURIComponent(ametOtsing)}&`;
    if (sortOrder) query += `tunnitasu=${sortOrder}&`;
    const data = await apiGet(query);
    setTootajad(data.filter(t => t.nimi.toLowerCase() !== "admin"));
  };

  useEffect(() => {
    loadAll();
  }, [sortOrder]);

  const resetFilters = () => {
    setNimiOtsing("");
    setAmetOtsing("");
    setDailyReportDate("");
    setSortOrder("");
    loadAll();
  };

  // Uue töötaja lisamine
  const lisaTootaja = async () => {
    try {
      await apiPost("/api/admin/AdminTootajate", uueTootaja);
      alert("Lisatud!");
      loadAll();
    } catch (err) {
      alert("VIGA: " + err.message);
    }
  };

  // Töötaja andmete uuendamine
  const uuendaTootaja = async (nimi) => {
    const amet = prompt("Uus amet:");
    const tunnitasu = prompt("Uus tunnitasu:");
    await apiPut(`/api/admin/AdminTootajate/${nimi}`, { amet, tunnitasu });
    loadAll();
  };

  // Töötaja eemaldamine
  const kustutaTootaja = async (nimi) => {
    if (!window.confirm("Kustutada töötaja?")) return;
    await apiDelete(`/api/admin/AdminTootajate/${nimi}`);
    loadAll();
  };

  // Palkade aruanne
  const loadSalaryReport = async () => {
    const data = await apiGet(`/api/admin/AdminTootajate/aruanne/palk`);
    setSalaryReport(data);
    setDailyReport([]);
  };

  // Igapäevane aruanne
  const loadDailyReport = async () => {
    if (!dailyReportDate) return;
    const data = await apiGet(`/api/admin/AdminTootajate/aruanne/${dailyReportDate}`);
    setDailyReport(data);
    setSalaryReport([]);
  };

  return (
    <div style={page}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={title}>Admin Paneel</h1>
            <LogoutButton />
        </header>
      <div style={topCard}>
        <div style={topItem}>
          <button style={btnMain} onClick={loadSalaryReport}>Kõigi töötajate palga aruanne</button>
        </div>

        <div style={topItem}>
          <input
            type="date"
            style={input}
            value={dailyReportDate}
            onChange={(e) => setDailyReportDate(e.target.value)}
          />
          <button style={btnMain} onClick={loadDailyReport}>Päeva aruanne</button>
        </div>

        <div style={topItem}>
          <input
            style={input}
            placeholder="Nimi"
            value={nimiOtsing}
            onChange={(e) => setNimiOtsing(e.target.value)}
          />
          <input
            style={input}
            placeholder="Amet"
            value={ametOtsing}
            onChange={(e) => setAmetOtsing(e.target.value)}
          />
          <button style={btnMain} onClick={loadAll}>Otsi töötajat</button>
        </div>

        <div style={topItem}>
          <button style={btnMain} onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            Sorteeri tunnitasu {sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : ""}
          </button>
        </div>

        <div style={topItem}>
          <button style={btnMain} onClick={resetFilters}>Lähtesta filtrid</button>
        </div>
      </div>
      <section style={section}>
        <h2 style={sectionTitle}>Töötajate nimekiri</h2>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>Nimi</th>
              <th style={th}>Amet</th>
              <th style={th}>Tunnitasu (€)</th>
              <th style={th}>Tegevused</th>
            </tr>
          </thead>
          <tbody>
            {tootajad.map((t) => (
              <tr key={t.isikukood} style={tr}>
                <td style={td}>{t.nimi}</td>
                <td style={td}>{t.amet}</td>
                <td style={td}>{t.tunnitasu}</td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => uuendaTootaja(t.nimi)}>Muuda</button>
                  <button style={btnDelete} onClick={() => kustutaTootaja(t.nimi)}>Kustuta</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* === Lisa uus töötaja === */}
      <section style={section}>
        <h2 style={sectionTitle}>Lisa uus töötaja</h2>
        <div style={formGrid}>
          {Object.keys(uueTootaja).map((key) => (
            <input
              key={key}
              style={input}
              type={key === "parool" ? "password" : key === "tunnitasu" ? "number" : "text"}
              placeholder={key}
              value={uueTootaja[key]}
              onChange={(e) => setUueTootaja({ ...uueTootaja, [key]: e.target.value })}
            />
          ))}
        </div>
        <button style={btnMain} onClick={lisaTootaja}>Lisa töötaja</button>
      </section>
      {salaryReport.length > 0 && (
        <section style={section}>
          <h2 style={sectionTitle}>Kõigi töötajate palga aruanne</h2>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>Nimi</th>
                <th style={th}>Tunnitasu</th>
                <th style={th}>Palk (€)</th>
              </tr>
            </thead>
            <tbody>
              {salaryReport.map((r) => (
                <tr key={r.nimi} style={tr}>
                  <td style={td}>{r.nimi}</td>
                  <td style={td}>{r.tunnitasu}</td>
                  <td style={td}>{r.palk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      {dailyReport.length > 0 && (
        <section style={section}>
          <h2 style={sectionTitle}>Päeva aruanne</h2>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>Nimi</th>
                <th style={th}>Kuupäev</th>
                <th style={th}>Sisse</th>
                <th style={th}>Välja</th>
                <th style={th}>Palk (€)</th>
              </tr>
            </thead>
            <tbody>
              {dailyReport.map((r, i) => (
                <tr key={i} style={tr}>
                  <td style={td}>{r.nimi}</td>
                  <td style={td}>{r.kuupaev}</td>
                  <td style={td}>{r.sissepaas}</td>
                  <td style={td}>{r.valjapaas}</td>
                  <td style={td}>{r.palk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
const page = { 
    padding: "20px", 
    fontFamily: "Arial, sans-serif", 
    background: "#f8f8f8" 
};
const title = { 
    textAlign: "center", 
    marginBottom: "30px" 
};
const topCard = { 
    display: "flex", 
    flexWrap: "wrap", 
    gap: "10px", 
    marginBottom: "20px", 
    padding: "15px", 
    background: "#fff", 
    borderRadius: "8px", 
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
};
const topItem = { 
    display: "flex", 
    alignItems: "center", 
    gap: "5px" 
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
const btnEdit = { 
    padding: "5px 10px", 
    background: "#ffa500", 
    color: "white", 
    border: "none", 
    borderRadius: "4px", 
    cursor: "pointer" 
};
const btnDelete = { 
    padding: "5px 10px", 
    background: "#e53935", 
    color: "white", 
    border: "none", 
    borderRadius: "4px", 
    cursor: "pointer" 
};
const input = { 
    padding: "8px", 
    borderRadius: "4px", 
    border: "1px solid #ccc" 
};
const formGrid = { 
    display: "grid", 
    gridTemplateColumns: "repeat(3, 1fr)", 
    gap: "10px", 
    marginBottom: "10px" 
};
