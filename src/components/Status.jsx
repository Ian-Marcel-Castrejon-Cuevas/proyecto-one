import { useState } from "react";
import * as XLSX from "xlsx";

function Status() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados para los campos del formulario
  const [status, setStatus] = useState("");
  const [carvenText, setCarvenText] = useState("");

  const handleSubmit = async () => {
    // Validaciones
    if (!status || status.trim() === "") {
      alert("Por favor, ingresa el status");
      return;
    }

    if (!carvenText || carvenText.trim() === "") {
      alert("Por favor, ingresa al menos un carven");
      return;
    }

    // Procesar los carven
    const carvenList = carvenText
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c !== "");

    if (carvenList.length === 0) {
      alert("No se encontraron carven válidos");
      return;
    }

    setLoading(true);
    setProgress(`Procesando ${carvenList.length} carven...`);
    setError("");
    setMostrarResultados(false);
    setResultados([]);

    try {
      // Llamada al backend
      const response = await fetch("http://192.168.28.35:3002/status/cambiar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status.trim(),
          claves: carvenList,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar los carven");
      }

      setProgress(
        `✅ ${data.actualizadas} de ${data.totalEnviadas} carven actualizados correctamente`,
      );

      // Crear resultados para mostrar en la tabla
      const resultadosFormateados = carvenList.map((carven) => ({
        carven: carven,
        status: status.trim(),
        resultado: data.clavesActualizadas.includes(carven)
          ? "Actualizado"
          : "No encontrado",
        mensaje: data.clavesActualizadas.includes(carven)
          ? "Status actualizado correctamente"
          : "El carven no existe en la base de datos",
      }));

      setResultados(resultadosFormateados);
      setMostrarResultados(true);

      setTimeout(() => {
        setProgress("");
      }, 5000);

      // Limpiar campos después del éxito
      setCarvenText("");
      setStatus("");
    } catch (err) {
      setError(err.message || "Error al procesar los carven");
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const descargarResultados = () => {
    if (resultados.length === 0) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(resultados);
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cambio_status_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isProcesarDisabled = () => {
    return (
      loading ||
      !status ||
      status.trim() === "" ||
      !carvenText ||
      carvenText.trim() === ""
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "650px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.98)",
          borderRadius: "32px",
          padding: "40px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#1e3c72",
            marginBottom: "5px",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          Cambio de Status
        </h1>
        <p style={{ color: "#666", marginBottom: "25px", fontSize: "14px" }}>
          Actualiza el status de múltiples carven
        </p>

        {/* Campo de Status */}
        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Status: <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Ej: 42"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: "#fff",
              fontFamily: "monospace",
            }}
          />
          <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
            Ingresa el código de status que deseas asignar
          </div>
        </div>

        {/* Área de texto para carven */}
        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Carven: <span style={{ color: "red" }}>*</span>
          </label>
          <textarea
            value={carvenText}
            onChange={(e) => setCarvenText(e.target.value)}
            placeholder="Ingresa los carven uno por línea&#10;Ejemplo:&#10;123213123&#10;31231231&#10;1231231"
            rows={6}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "14px",
              backgroundColor: "#fff",
              fontFamily: "monospace",
              resize: "vertical",
              minHeight: "120px",
            }}
          />
          <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
            {carvenText.split("\n").filter((c) => c.trim()).length} carven
            ingresados
          </div>
        </div>

        {/* Botón de acción */}
        <button
          onClick={handleSubmit}
          disabled={isProcesarDisabled()}
          style={{
            width: "100%",
            padding: "14px",
            background: isProcesarDisabled()
              ? "#ccc"
              : "linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: isProcesarDisabled() ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: isProcesarDisabled()
              ? "none"
              : "0 5px 20px rgba(255, 107, 53, 0.4)",
          }}
        >
          {loading ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <span
                className="spinner"
                style={{
                  display: "inline-block",
                  width: "18px",
                  height: "18px",
                  border: "2px solid white",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              ></span>
              Procesando...
            </span>
          ) : (
            "Cambiar Status"
          )}
        </button>

        {/* Resultados */}
        {mostrarResultados && resultados.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#e8f5e9",
              borderRadius: "12px",
              border: "1px solid #c8e6c9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontWeight: "bold", color: "#2e7d32" }}>
                ✅ {resultados.length} carven procesados
              </div>
              <button
                onClick={descargarResultados}
                style={{
                  padding: "6px 16px",
                  background: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#1565c0")}
                onMouseLeave={(e) => (e.target.style.background = "#1976d2")}
              >
                📥 Descargar Excel
              </button>
            </div>

            {/* Tabla de resultados */}
            <div
              style={{
                maxHeight: "200px",
                overflow: "auto",
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead
                  style={{
                    background: "#f5f5f5",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Carven
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      Resultado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom:
                          idx < resultados.length - 1
                            ? "1px solid #eee"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        {item.carven}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                        }}
                      >
                        {item.status}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color:
                            item.resultado === "Actualizado"
                              ? "#2e7d32"
                              : "#c62828",
                          fontWeight: "500",
                          fontSize: "12px",
                        }}
                      >
                        {item.resultado}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {progress && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px 14px",
              background: progress.includes("✅") ? "#e8f5e9" : "#fff3e0",
              borderRadius: "10px",
              fontSize: "13px",
              color: progress.includes("✅") ? "#2e7d32" : "#e65100",
              borderLeft: progress.includes("✅")
                ? "3px solid #2e7d32"
                : "3px solid #ff6b35",
              textAlign: "left",
            }}
          >
            <span>{progress}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px 14px",
              background: "#ffebee",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#c62828",
              borderLeft: "3px solid #c62828",
              textAlign: "left",
            }}
          >
            <span>❌ {error}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default Status;
