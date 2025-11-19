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
  const [salaryReportMonth, setSalaryReportMonth] = useState("");
  const [salaryReportYear, setSalaryReportYear] = useState("");
  const [salaryReport, setSalaryReport] = useState([]);

  const kuuNimed = [
    "Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni",
    "Juuli", "August", "September", "Oktoober", "November", "Detsember"
  ];

  const loadAll = async () => {
    let query = "/api/admin/AdminTootajate?";
    if (nimiOtsing) query += `nimi=${encodeURIComponent(nimiOtsing)}&`;
    if (ametOtsing) query += `amet=${encodeURIComponent(ametOtsing)}&`;
    if (sortOrder) query += `sortAsc=${sortOrder === "asc" ? true : false}&`;
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
    setSalaryReportMonth("");
    setSalaryReportYear("");
    setSortOrder("");
    setDailyReport([]);
    setSalaryReport([]);
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

  // Päevaaruanne
  const loadDailyReport = async () => {
    if (!dailyReportDate) return;
    const data = await apiGet(`/api/admin/AdminTootajate/aruanne/${dailyReportDate}`);
    setDailyReport(data);
    setSalaryReport([]);
  };

  // Palkade aruanne kuupõhiselt
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1); 

  const loadMonthlySalaryReport = async () => {
    if (!salaryMonth || !salaryYear) return alert("Vali kuu ja aasta");

    const data = await apiGet(
      `/api/admin/AdminTootajate/aruanne/palk?aasta=${salaryYear}&kuu=${salaryMonth}`
    );

    if (!data || !data.andmed) return; 

    setSalaryReport(
      data.andmed.map(r => ({
        ...r,
        kokkuTunnid: r.kokkuTunnid.toFixed(2),
        palk: r.palk.toFixed(2)
      }))
    );

    setDailyReport([]);
  };

  return (
    <div style={page}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={title}>Admin Paneel</h1>
        <LogoutButton />
      </header>

      <div style={topCard}>
        {/* Päevaaruanne */}
        <div style={topItem}>
          <input
            type="date"
            style={input}
            value={dailyReportDate}
            onChange={(e) => setDailyReportDate(e.target.value)}
          />
          <button style={btnMain} onClick={loadDailyReport}>Päeva aruanne</button>
        </div>

        {/* Kuupõhine palkade aruanne */}
        <div style={topItem}>
          <select style={input} value={salaryMonth} onChange={e => setSalaryMonth(e.target.value)}>
            <option value="">Kuu</option>
            {kuuNimed.map((k, i) => (
              <option key={i} value={i+1}>{k}</option>
            ))}
          </select>
          <input
            type="number"
            style={input}
            placeholder="Aasta"
            value={salaryYear}
            onChange={e => setSalaryYear(e.target.value)}
          />
          <button style={btnMain} onClick={loadMonthlySalaryReport}>Kuupõhine palk</button>
        </div>


        {/* Filtrid ja sorteerimine */}
        <div style={topItem}>
          <input style={input} placeholder="Nimi" value={nimiOtsing} onChange={(e) => setNimiOtsing(e.target.value)} />
          <input style={input} placeholder="Amet" value={ametOtsing} onChange={(e) => setAmetOtsing(e.target.value)} />
          <button style={btnMain} onClick={loadAll}>Otsi töötajat</button>
          <button style={btnMain} onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            Sorteeri tunnitasu {sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : ""}
          </button>
          <button style={btnMain} onClick={resetFilters}>Lähtesta filtrid</button>
        </div>
      </div>

      {/* Töötajate nimekiri */}
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

      {/* Päevaaruanne */}
      {dailyReport.length > 0 && (
        <section style={section}>
          <h2 style={sectionTitle}>Päeva aruanne ({dailyReportDate})</h2>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>Nimi</th>
                <th style={th}>Sisse</th>
                <th style={th}>Välja</th>
                <th style={th}>Tunnid</th>
                <th style={th}>Staatus</th>
              </tr>
            </thead>
            <tbody>
              {dailyReport
                .filter(r => r.nimi.toLowerCase() !== "admin") 
                .map((r, i) => (
                  <tr key={i} style={tr}>
                    <td style={td}>{r.nimi}</td>
                    <td style={td}>{r.sissepaas}</td>
                    <td style={td}>{r.valjapaas}</td>
                    <td style={td}>{Number(r.tunnid).toFixed(2)}</td>
                    <td style={td}>{r.staatus}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Kuupõhine palk */}
      {salaryReport.length > 0 && (
        <section style={section}>
          <h2 style={sectionTitle}>Palk ({kuuNimed[salaryMonth-1]} {salaryYear})</h2>
          <table style={table}>
            <thead>
              <tr style={theadRow}>
                <th style={th}>Nimi</th>
                <th style={th}>Kokku Tunnid</th>
                <th style={th}>Palk (€)</th>
              </tr>
            </thead>
            <tbody>
              {salaryReport.map((r, i) => (
                <tr key={i} style={tr}>
                  <td style={td}>{r.nimi}</td>
                  <td style={td}>{r.kokkuTunnid}</td>
                  <td style={td}>{r.palk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
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
