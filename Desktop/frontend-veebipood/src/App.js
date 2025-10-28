import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activeTable, setActiveTable] = useState("arve");
  const [arved, setArved] = useState([]);
  const [aadressid, setAadressid] = useState([]);
  const [kontaktid, setKontaktid] = useState([]);
  const [maksestaatus, setMaksestaatus] = useState([]);
  const [tooted, setTooted] = useState([]);
  const [kliendid, setKliendid] = useState([]);
  const [kategooriad, setKategooriad] = useState([]);
  const [arveread, setArveread] = useState([]);

  const tableStyle = {
    border: "1px solid #ddd",
    borderCollapse: "collapse",
    width: "90%",
    margin: "20px auto",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  };
  const thStyle = {
    border: "1px solid #ddd",
    padding: "12px",
    backgroundColor: "#04AA6D",
    color: "white",
    textTransform: "uppercase",
  };
  const tdStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "center" };

  useEffect(() => {
    fetch("https://localhost:7202/api/Arve").then(res => res.json()).then(setArved);
    fetch("https://localhost:7202/api/Aadress").then(res => res.json()).then(setAadressid);
    fetch("https://localhost:7202/api/Kontaktandmed").then(res => res.json()).then(setKontaktid);
    fetch("https://localhost:7202/api/Maksestaatus").then(res => res.json()).then(setMaksestaatus);
    fetch("https://localhost:7202/api/Toode").then(res => res.json()).then(setTooted);
    fetch("https://localhost:7202/api/Klient").then(res => res.json()).then(setKliendid);
    fetch("https://localhost:7202/api/Kategooria").then(res => res.json()).then(setKategooriad);
    fetch("https://localhost:7202/api/Arverida").then(res => res.json()).then(setArveread);
  }, []);

  const navButton = (isActive) => ({
    padding: "10px 18px",
    marginRight: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: isActive ? "#04AA6D" : "#e6e6e6",
    color: isActive ? "white" : "#333",
    transition: "all 0.3s ease",
    boxShadow: isActive
      ? "0 4px 10px rgba(0, 128, 0, 0.3)"
      : "0 2px 5px rgba(0, 0, 0, 0.1)",
  });

  const navContainer = {
    margin: "20px auto",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginTop: "20px", color: "#333" }}>Veebipood Andmehaldus</h1>

      <nav style={navContainer}>
        <button style={navButton(activeTable === "arve")} onClick={() => setActiveTable("arve")}>Arve</button>
        <button style={navButton(activeTable === "arverida")} onClick={() => setActiveTable("arverida")}>Arverida</button>
        <button style={navButton(activeTable === "klient")} onClick={() => setActiveTable("klient")}>Klient</button>
        <button style={navButton(activeTable === "aadress")} onClick={() => setActiveTable("aadress")}>Aadress</button>
        <button style={navButton(activeTable === "kontakt")} onClick={() => setActiveTable("kontakt")}>Kontaktandmed</button>
        <button style={navButton(activeTable === "maksestaatus")} onClick={() => setActiveTable("maksestaatus")}>Maksestaatus</button>
        <button style={navButton(activeTable === "toode")} onClick={() => setActiveTable("toode")}>Toode</button>
        <button style={navButton(activeTable === "kategooria")} onClick={() => setActiveTable("kategooria")}>Kategooria</button>
      </nav>

      {/* --- ARVE --- */}
      {activeTable === "arve" && (
        <div>
          <h2>Arve</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Kuupäev</th>
                <th style={thStyle}>Kogusumma</th>
                <th style={thStyle}>Klient</th>
                <th style={thStyle}>Maksestaatus</th>
              </tr>
            </thead>
            <tbody>
              {arved.map(a => (
                <tr key={a.id}>
                  <td style={tdStyle}>{a.id}</td>
                  <td style={tdStyle}>{a.kuupaev ? new Date(a.kuupaev).toLocaleDateString() : "-"}</td>
                  <td style={tdStyle}>{a.kogusumma}</td>
                  <td style={tdStyle}>{a.klient ? a.klient.nimi : "-"}</td>
                  <td style={tdStyle}>{a.maksestaatus ? (a.maksestaatus.makstud ? "Makstud" : "Mitte makstud") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ARVERIDA --- */}
      {activeTable === "arverida" && (
        <div>
          <h2>Arverida</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Toode</th>
                <th style={thStyle}>Kogus</th>
              </tr>
            </thead>
            <tbody>
              {arveread.map(r => (
                <tr key={r.id}>
                  <td style={tdStyle}>{r.id}</td>
                  <td style={tdStyle}>{r.toode ? r.toode.nimetus : "-"}</td>
                  <td style={tdStyle}>{r.kogus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- KLIENT --- */}
      {activeTable === "klient" && (
        <div>
          <h2>Klient</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nimi</th>
                <th style={thStyle}>Kontaktandmed</th>
                <th style={thStyle}>Aadress</th>
              </tr>
            </thead>
            <tbody>
              {kliendid.map(k => (
                <tr key={k.id}>
                  <td style={tdStyle}>{k.id}</td>
                  <td style={tdStyle}>{k.nimi}</td>
                  <td style={tdStyle}>{k.kontaktandmed ? `${k.kontaktandmed.email} / ${k.kontaktandmed.telefoninumber}` : "-"}</td>
                  <td style={tdStyle}>{k.aadress ? `${k.aadress.tanav} ${k.aadress.maja}, ${k.aadress.linn}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- AADRESS --- */}
      {activeTable === "aadress" && (
        <div>
          <h2>Aadress</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Tänav</th>
                <th style={thStyle}>Maja</th>
                <th style={thStyle}>Linn</th>
                <th style={thStyle}>Postiindeks</th>
              </tr>
            </thead>
            <tbody>
              {aadressid.map(a => (
                <tr key={a.id}>
                  <td style={tdStyle}>{a.id}</td>
                  <td style={tdStyle}>{a.tanav}</td>
                  <td style={tdStyle}>{a.maja}</td>
                  <td style={tdStyle}>{a.linn}</td>
                  <td style={tdStyle}>{a.postiindeks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- KONTAKTANDMED --- */}
      {activeTable === "kontakt" && (
        <div>
          <h2>Kontaktandmed</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Telefon</th>
                <th style={thStyle}>Email</th>
              </tr>
            </thead>
            <tbody>
              {kontaktid.map(k => (
                <tr key={k.id}>
                  <td style={tdStyle}>{k.id}</td>
                  <td style={tdStyle}>{k.telefoninumber}</td>
                  <td style={tdStyle}>{k.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MAKSESTAATUS --- */}
      {activeTable === "maksestaatus" && (
        <div>
          <h2>Maksestaatus</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Makstud</th>
                <th style={thStyle}>Maksetähtaeg</th>
                <th style={thStyle}>Makstud Summa</th>
                <th style={thStyle}>Maksmise Kuupäev</th>
              </tr>
            </thead>
            <tbody>
              {maksestaatus.map(m => (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.id}</td>
                  <td style={tdStyle}>{m.makstud ? "Jah" : "Ei"}</td>
                  <td style={tdStyle}>{m.maksetahtaeg ? new Date(m.maksetahtaeg).toLocaleDateString() : "-"}</td>
                  <td style={tdStyle}>{m.makstudSumma}</td>
                  <td style={tdStyle}>{m.maksmiseKuupaev ? new Date(m.maksmiseKuupaev).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TOODE --- */}
      {activeTable === "toode" && (
        <div>
          <h2>Toode</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nimetus</th>
                <th style={thStyle}>Kategooria</th>
                <th style={thStyle}>Hind (€)</th>
                <th style={thStyle}>Laokogus</th>
                <th style={thStyle}>Aktiivne</th>
                <th style={thStyle}>Vananemisaeg</th>
                <th style={thStyle}>Pilt</th>
              </tr>
            </thead>
            <tbody>
              {tooted.map(t => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.id}</td>
                  <td style={tdStyle}>{t.nimetus}</td>
                  <td style={tdStyle}>{t.kategooria ? t.kategooria.nimetus : "-"}</td>
                  <td style={tdStyle}>{t.hind}</td>
                  <td style={tdStyle}>{t.laokogus}</td>
                  <td style={tdStyle}>{t.aktiivne ? "Jah" : "Ei"}</td>
                  <td style={tdStyle}>{t.vananemisaeg ? new Date(t.vananemisaeg).toLocaleDateString() : "-"}</td>
                  <td style={tdStyle}>
                    {t.pildiUrl ? (
                      <img
                        src={t.pildiUrl}
                        alt={t.nimetus}
                        style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- KATEGOORIA --- */}
      {activeTable === "kategooria" && (
        <div>
          <h2>Kategooriad</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Nimetus</th>
              </tr>
            </thead>
            <tbody>
              {kategooriad.map(k => (
                <tr key={k.id}>
                  <td style={tdStyle}>{k.id}</td>
                  <td style={tdStyle}>{k.nimetus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
