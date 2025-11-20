import LogoutButton from "../components/LogoutButton";
import { useEffect, useState, useContext } from "react";
import { apiGet, apiPut, apiPost } from "../api/api";
import { AuthContext } from "../auth/AuthContext";

export default function TootajaPage() {
  const { name } = useContext(AuthContext);

  const [userData, setUserData] = useState({
    nimi: "",
    isikukood: "",
    amet: "",
    tunnitasu: 0,
    email: "",
  });

  const [worktimes, setWorktimes] = useState([]);
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());

  const [appliedMonth, setAppliedMonth] = useState(new Date().getMonth() + 1);
  const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());

  const [showPersonal, setShowPersonal] = useState(false);

  const [imageState, setImageState] = useState("none");

  const kuuNimed = [ "Jaanuar", "Veebruar", "Märts", "Aprill","Mai", "Juuni","Juuli",
    "August", "September", "Oktoober","November", "Detsember"
  ];

  useEffect(() => {
    loadUserData();
    loadWorktimes();

  }, []);

  const loadUserData = async () => {
    try {
      const data = await apiGet(`/api/tootaja/Tootajate/${name}`);
      if (data) setUserData(data);
    } catch (err) {
      console.error("loadUserData:", err);
    }
  };

  const loadWorktimes = async () => {
    try {
      const data = await apiGet(`/api/Worktime/tootaja/${name}`);
      const formatted =
        data?.worktimes?.map((w) => ({
          RawKuupaev: w.kuupaev,
          Kuupaev: w.kuupaev ? new Date(w.kuupaev).toLocaleDateString() : "-",
          Sissepaas: w.sissepaas ? w.sissepaas.slice(0, 5) : "-",
          Valjapaas: w.valjapaas ? w.valjapaas.slice(0, 5) : "",
          Palk: w.palk != null ? Number(w.palk) : 0,
        })) || [];

      setWorktimes(formatted);
    } catch (err) {
      console.error("loadWorktimes:", err);
      setWorktimes([]);
    }
  };

  const isWorking = worktimes.some((w) => !w.Valjapaas);
  const activeWork = worktimes.find((w) => !w.Valjapaas);

  const startWorkday = async () => {
    try {
      const now = new Date();
      await apiPost(`/api/Worktime/tootaja/lisada/${name}`, {
        Kuupaev: now.toISOString().split("T")[0],
        Sissepaas: now.toTimeString().slice(0, 5),
      });

      setImageState("start"); 
      await loadWorktimes();
    } catch (err) {
      alert(err.message || "Start failed");
    }
  };

  const finishActiveWork = async () => {
    try {
      if (!activeWork) {
        alert("Pole aktiivset tööaega lõpetamiseks");
        return;
      }
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");

      await apiPut(`/api/Worktime/valjapaas/${name}/${activeWork.RawKuupaev}`, {
        Valjapaas: `${hh}:${mm}`,
      });

      setImageState("end"); 
      await loadWorktimes();
    } catch (err) {
      alert(err.message || "Finish failed");
    }
  };
  const handleStartStop = async () => {
    if (!isWorking) {
      await startWorkday();
    } else {
      await finishActiveWork();
    }
  };

  const updateUserData = async () => {
    try {
      await apiPut(`/api/tootaja/Tootajate/${name}`, userData);
      alert("Andmed uuendatud!");
      await loadUserData();
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const applyFilter = () => {
    if (!salaryMonth || !salaryYear) {
      alert("Vali kuu ja aasta");
      return;
    }
    setAppliedMonth(salaryMonth);
    setAppliedYear(salaryYear);
  };

  const filteredWorktimes = worktimes.filter((w) => {
    if (!w.RawKuupaev) return false;
    const d = new Date(w.RawKuupaev);
    return d.getMonth() + 1 === appliedMonth && d.getFullYear() === appliedYear;
  });

  const todayISO = new Date().toISOString().split("T")[0];

  const hasActiveWorktime = worktimes.some((w) => !w.Valjapaas);
  const kuuKokku = filteredWorktimes.reduce((sum, w) => sum + w.Palk, 0);

  const todayWork = worktimes.find( w => w.RawKuupaev === todayISO);
  const hasStartedToday = todayWork && !todayWork.Valjapaas; 
  const hasFinishedToday = todayWork && todayWork.Valjapaas; 

  const calculateHours = (sisse, valja) => {
  if (!sisse || !valja) return 0;
  const [h1, m1] = sisse.split(":").map(Number);
  const [h2, m2] = valja.split(":").map(Number);
  return (h2 + m2 / 60) - (h1 + m1 / 60);
};


  return (
    <div style={page}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={title}>Tere, {userData.nimi || name}! Minu andmed ja tööajad</h1>
        <LogoutButton />
      </header>

      {/* Hetkel töötab indikaator */}
      {hasActiveWorktime && <div style={workIndicator}>🟢 Hetkel töötab</div>}

      <div style={{ marginTop: 10, marginBottom: 18 }}>
        <button style={isWorking ? btnStop : btnStart} onClick={handleStartStop}>
          {isWorking ? "Lõpeta tööpäev" : "Alusta tööpäeva"}
        </button>
      </div>

      <div>
        {/* Täna pole veel töötanud */}
        {!hasStartedToday && !hasFinishedToday && (
          <img src="/images/start.png" style={imageStyle} />
        )}

        {/* Alustas ja töötab siiani */}
        {hasStartedToday && (
          <img src="/images/terehommikust.png" style={imageStyle} />
        )}
        {/* Täna lõpetas töö */}
        {hasFinishedToday && (
          <img src="/images/headaega.jpg" style={imageStyle} />
        )}
      </div>

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <button
          onClick={() => {
            setShowPersonal((s) => !s);
          }}
          style={btnMain}
        >
          {showPersonal ? "Peida Minu andmed" : "Minu andmed"}
        </button>
      </div>

      {showPersonal && (
        <>
          {/* Minu andmed */}
          <section style={section}>
            <h2 style={sectionTitle}>Minu andmed</h2>
            <div style={formGrid}>
              <input
                style={input}
                type="text"
                value={userData.nimi}
                onChange={(e) => setUserData({ ...userData, nimi: e.target.value })}
                placeholder="Nimi"
              />
              <input style={input} type="text" value={userData.isikukood} disabled placeholder="Isikukood" />
              <input style={input} type="text" value={userData.amet} disabled placeholder="Amet" />
              <input style={input} type="number" value={userData.tunnitasu} disabled placeholder="Tunnitasu" />
              <input
                style={input}
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                placeholder="Email"
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <button style={btnMain} onClick={updateUserData}>
                Salvesta
              </button>
            </div>
          </section>

          {/* Minu tööajad */}
          <section style={section}>
            <h2 style={sectionTitle}>Minu tööajad</h2>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <label>
                  Kuu:
                  <select
                    value={salaryMonth}
                    onChange={(e) => setSalaryMonth(Number(e.target.value))}
                    style={{ ...input, marginLeft: 6 }}
                  >
                    {kuuNimed.map((kuu, i) => (
                      <option key={i} value={i + 1}>
                        {kuu}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Aasta:
                  <select
                    value={salaryYear}
                    onChange={(e) => setSalaryYear(Number(e.target.value))}
                    style={{ ...input, marginLeft: 6 }}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <option key={i} value={new Date().getFullYear() - 2 + i}>
                        {new Date().getFullYear() - 2 + i}
                      </option>
                    ))}
                  </select>
                </label>

                <button style={btnMain} onClick={applyFilter}>
                  Filtreeri
                </button>
                <div style={{ marginLeft: 12, fontWeight: "600" }}>
                  {kuuNimed[appliedMonth - 1]} {appliedYear}
                </div>
              </div>
            </div>
            <table style={table}>
              <thead>
                <tr style={theadRow}>
                  <th style={th}>Kuupäev</th>
                  <th style={th}>Sisse</th>
                  <th style={th}>Välja</th>
                  <th style={th}>Tunnid</th>
                  <th style={th}>Palk (€)</th>
                </tr>
              </thead>

              <tbody>
                {filteredWorktimes.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 12, textAlign: "center" }}>
                      Pole kirjeid sellel kuul/aastal
                    </td>
                  </tr>
                )}

                {filteredWorktimes.map((w, i) => {
                  const hours = calculateHours(w.Sissepaas, w.Valjapaas);
                  return (
                    <tr key={i} style={tr}>
                      <td style={td}>{w.Kuupaev}</td>
                      <td style={td}>{w.Sissepaas}</td>
                      <td style={{ ...td, color: !w.Valjapaas ? "red" : "black" }}>
                        {!w.Valjapaas ? "veel töötab" : w.Valjapaas}
                      </td>
                      <td style={td}>{hours.toFixed(2)}</td>
                      <td style={td}>{w.Palk.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ ...td, fontWeight: "bold" }}>Kokku</td>
                  <td style={{ ...td, fontWeight: "bold" }}>
                    {filteredWorktimes.reduce(
                      (sum, w) => sum + calculateHours(w.Sissepaas, w.Valjapaas),
                      0
                    ).toFixed(2)}
                  </td>
                  <td style={{ ...td, fontWeight: "bold" }}>
                    {filteredWorktimes.reduce((sum, w) => sum + (w.Palk || 0), 0).toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>
        </>
      )}
    </div>
  );

  async function autoFinishByRawDate(rawDate) {
    try {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      await apiPut(`/api/Worktime/valjapaas/${name}/${rawDate}`, {
        Valjapaas: `${hh}:${mm}`,
      });
      setImageState("end");
      await loadWorktimes();
    } catch (err) {
      alert(err.message || "Finish failed");
    }
  }
}

const imageStyle = {
  width: 260,
  marginTop: 10,
  marginBottom: 10,
};

const workIndicator = {
  background: "#d4ffd4",
  color: "#0a7a0a",
  padding: "10px",
  borderRadius: "8px",
  fontWeight: "bold",
  marginBottom: "20px",
  textAlign: "center",
  border: "1px solid #7fd67f",
};

const btnStart = {
  padding: "10px 18px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "10px",
};

const btnStop = {
  padding: "10px 18px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginBottom: "10px",
};

const btnMain = {
  padding: "8px 14px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const btnFinish = {
  padding: "6px 12px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const page = {
  padding: "20px",
  fontFamily: "Arial, sans-serif",
  background: "#f8f8f8",
};

const title = {
  textAlign: "center",
  marginBottom: "8px",
};

const section = {
  background: "white",
  padding: "18px",
  marginBottom: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const sectionTitle = { marginBottom: "12px" };

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "10px",
  marginBottom: "10px",
};

const input = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
};

const theadRow = {
  background: "#4CAF50",
  color: "white",
};

const th = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "center",
};

const tr = {
  background: "#fff",
  borderBottom: "1px solid #eee",
};

const td = {
  padding: "8px",
  border: "1px solid #eee",
  textAlign: "center",
};

const btnFinishRow = {
  padding: "6px 10px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
