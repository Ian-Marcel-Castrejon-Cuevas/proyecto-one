import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Carven2 from "./components/Carven2";
import AdminPanel from "./components/AdminPanel";
import Leyendas from "./components/Leyendas";
import PlantillasWhatsApp from "./components/PlantillasWhatsApp";

// Componente principal de verificación de cuentas EDOMEX
function ProyectOne() {
  const navigate = useNavigate();
  const [archivosProcesados, setArchivosProcesados] = useState([]);
  const [showTextArea, setShowTextArea] = useState(false);
  const [carvenNumbers, setCarvenNumbers] = useState("");
  const [tieneResultados, setTieneResultados] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef(null);

  const borrarIngresos = async () => {
    if (window.confirm("¿Estas seguro de botar carven?.")) {
      setIsDeleting(true);
      try {
        const response = await fetch(
          "http://192.168.28.35:3002/verificacion/borrar-ingresos",
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await response.json();

        if (response.ok) {
          alert(
            `${data.mensaje}\nRegistros botados: ${data.registrosEliminados}`,
          );
        } else {
          alert(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error al borrar:", error);
        alert("❌ Error de conexión con el servidor");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const irALeyendas = () => {
    navigate("/leyendas");
  };

  const verificarCuentas = async (claves, workbook, file) => {
    try {
      const clavesLimpias = claves.map((r) => r.toString());

      const response = await fetch("http://192.168.28.35:3002/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claves: clavesLimpias }),
      });

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data.length > 0) {
        setArchivosProcesados((prev) => [
          ...prev,
          {
            nombre: file?.name || "Entrada manual",
            resultado: data,
            archivoDescargable: null,
          },
        ]);
        setTieneResultados(true);
      } else if (workbook && file) {
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(hoja, { defval: "" });

        const nuevoJson = json.map((fila) => {
          const { CARVEN, CLAVE, Carven, Clave, ...resto } = fila;
          return resto;
        });

        const nuevaHoja = XLSX.utils.json_to_sheet(nuevoJson);
        workbook.Sheets[workbook.SheetNames[0]] = nuevaHoja;

        const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        setArchivosProcesados((prev) => [
          ...prev,
          { nombre: file.name, resultado: [], archivoDescargable: url },
        ]);
        setTieneResultados(true);
      } else {
        setArchivosProcesados((prev) => [
          ...prev,
          { nombre: "Entrada manual", resultado: [], archivoDescargable: null },
        ]);
        setTieneResultados(true);
      }
    } catch (error) {
      console.error("Error al verificar:", error);
    }
  };

  const manejarArchivo = (event) => {
    const files = event.target.files;
    if (!files) return;

    setArchivosProcesados([]);
    setTieneResultados(true);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(hoja);

        const salida = json
          .map((fila) => fila.CARVEN || fila.CLAVE)
          .filter(Boolean);

        verificarCuentas(salida, workbook, file);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const abrirSelectorArchivos = () => {
    setArchivosProcesados([]);
    setShowTextArea(false);
    setCarvenNumbers("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const cancelarCarga = () => {
    setArchivosProcesados([]);
    setShowTextArea(false);
    setCarvenNumbers("");
    setTieneResultados(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const descargarTodos = () => {
    archivosProcesados.forEach((item) => {
      if (item.archivoDescargable) {
        const link = document.createElement("a");
        link.href = item.archivoDescargable;
        link.download = `${item.nombre}`;
        link.click();
      }
    });
  };

  const manejarTextoManual = () => {
    const numbers = carvenNumbers
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");
    verificarCuentas(numbers, null, null);
  };

  return (
    <div className="app">
      <div
        className={`container ${tieneResultados ? "has-results" : "centered"}`}
      >
        <div className={`header ${tieneResultados ? "header-compact" : ""}`}>
          <div className="header-top">
            <button
              className="btn-borrar-header"
              onClick={borrarIngresos}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Botar Carven"}
            </button>
            <button className="btn-borrar-header" onClick={irALeyendas}>
              Leyendas
            </button>
          </div>
          <h1>Verificación de cuentas EDO MEX</h1>
          <p className="subtitle">
            Carga archivos o ingresa números manualmente
          </p>
        </div>

        <div className="actions">
          <input
            type="file"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={manejarArchivo}
            accept=".xlsx,.xls"
            multiple
          />

          <button className="btn btn-primary" onClick={abrirSelectorArchivos}>
            Añadir archivos
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowTextArea(!showTextArea)}
          >
            Buscar manual
          </button>

          <button className="btn btn-outline" onClick={cancelarCarga}>
            Cancelar
          </button>
        </div>

        {showTextArea && (
          <div className="manual-panel">
            <textarea
              className="manual-textarea"
              rows={6}
              value={carvenNumbers}
              onChange={(e) => setCarvenNumbers(e.target.value)}
              placeholder="Pega aquí los números CARVEN...&#10;Uno por línea"
            />
            <button className="btn btn-success" onClick={manejarTextoManual}>
              Verificar números
            </button>
          </div>
        )}

        {tieneResultados && archivosProcesados.length > 0 && (
          <div className="results">
            <div className="results-header">
              <h2>Resultados</h2>
              {archivosProcesados.some((item) => item.archivoDescargable) && (
                <button
                  className="btn btn-download-all"
                  onClick={descargarTodos}
                >
                  ⬇ Descargar todos
                </button>
              )}
            </div>

            {archivosProcesados.map((item, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <span className="card-icon">📄</span>
                  <span className="card-title">{item.nombre}</span>
                  {item.archivoDescargable && (
                    <a
                      href={item.archivoDescargable}
                      download={`${item.nombre}`}
                      className="btn-download"
                    >
                      ⬇ Descargar
                    </a>
                  )}
                </div>

                {item.resultado.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Clave</th>
                          <th>CP</th>
                          <th>Municipio</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.resultado.map((row, i) => (
                          <tr key={i}>
                            <td className="clave-cell">
                              {row.Clave || row.clave}
                            </td>
                            <td>{row.CP || row.cp}</td>
                            <td>{row.Municipio || row.municipio}</td>
                            <td>{row.Estado || row.estado}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">🔍</span>
                    <p>No se encuentran cuentas EDOMEX</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/proyect-one" element={<ProyectOne />} />
      <Route path="/carven2" element={<Carven2 />} />
      <Route path="/carven2/admin" element={<AdminPanel />} />
      <Route path="/leyendas" element={<Leyendas />} />
      <Route path="/plantillas-whatsapp" element={<PlantillasWhatsApp />} />
      <Route path="/" element={<ProyectOne />} />
    </Routes>
  );
}

export default App;
