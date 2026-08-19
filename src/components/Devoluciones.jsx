import { useState, useRef } from "react";
import * as XLSX from "xlsx";

function Devoluciones() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estados para los campos del formulario
  const [tipoIdentificador, setTipoIdentificador] = useState("carven");
  const [columnasDisponibles, setColumnasDisponibles] = useState([]);
  const [columnaIdentificador, setColumnaIdentificador] = useState("");
  const [columnaFecha, setColumnaFecha] = useState("");
  const [columnaCodStatus, setColumnaCodStatus] = useState("");

  const [fechaDefault, setFechaDefault] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  });

  const [codStatusDefault, setCodStatusDefault] = useState("");
  const [datosProcesados, setDatosProcesados] = useState([]);

  const [resumenColumnas, setResumenColumnas] = useState([]);
  const [archivoCargado, setArchivoCargado] = useState(false);

  const fileInputRef = useRef(null);

  // Función para formatear serial de Excel a fecha legible (corrigiendo zona horaria)
  const serialToDate = (serial) => {
    if (typeof serial !== "number") return String(serial);

    // Excel serial: días desde 1899-12-30
    // Usamos UTC para evitar problemas de zona horaria
    const fecha = new Date(Date.UTC(1899, 11, 30 + serial));

    const day = String(fecha.getUTCDate()).padStart(2, "0");
    const month = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const year = fecha.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const procesarArchivoParaColumnas = async (selectedFile) => {
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];

      // Leer los datos crudos
      const json = XLSX.utils.sheet_to_json(hoja, {
        defval: "",
        raw: true,
      });

      if (json.length > 0) {
        // Obtener todas las columnas del archivo
        const todasLasColumnas = Object.keys(json[0]);

        // Filtrar columnas que tengan al menos 1 registro no vacío
        const columnasConDatos = todasLasColumnas.filter((col) => {
          if (col === "_EMPTY" || col.startsWith("_EMPTY_")) {
            return false;
          }
          const tieneDatos = json.some((fila) => {
            const valor = fila[col];
            return valor !== undefined && valor !== null && valor !== "";
          });
          return tieneDatos;
        });

        setColumnasDisponibles(columnasConDatos);
        setDatosProcesados(json);

        // Generar resumen de columnas
        const resumen = columnasConDatos.map((col) => {
          const count = json.filter((fila) => {
            const valor = fila[col];
            return valor !== undefined && valor !== null && valor !== "";
          }).length;

          // Obtener el primer valor no vacío como ejemplo
          let ejemplo = "";
          for (const fila of json) {
            const valor = fila[col];
            if (valor !== undefined && valor !== null && valor !== "") {
              // Si es un número y parece fecha (serial de Excel entre 30000 y 50000)
              if (typeof valor === "number" && valor > 30000 && valor < 50000) {
                ejemplo = serialToDate(valor);
              } else {
                ejemplo = String(valor).substring(0, 50);
              }
              break;
            }
          }

          return { columna: col, registros: count, ejemplo };
        });
        setResumenColumnas(resumen);

        setColumnaIdentificador("");
        setColumnaFecha("");
        setColumnaCodStatus("");

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al leer el archivo:", error);
      return false;
    }
  };

  const processFile = async (selectedFile) => {
    const name = selectedFile.name;
    const extension = name.split(".").pop()?.toLowerCase();

    if (extension === "xlsx" || extension === "xls") {
      setFile(selectedFile);
      setFileName(name);
      setError("");
      setProgress("");
      setMostrarResultados(false);
      setResultados([]);
      setDatosProcesados([]);
      setColumnasDisponibles([]);
      setColumnaIdentificador("");
      setColumnaFecha("");
      setColumnaCodStatus("");
      setArchivoCargado(false);
      setResumenColumnas([]);

      const success = await procesarArchivoParaColumnas(selectedFile);
      if (!success) {
        setError("No se pudieron leer las columnas del archivo");
      } else {
        setArchivoCargado(true);
      }
    } else {
      alert("Formato no soportado. Solo archivos Excel (.xlsx o .xls)");
      setFile(null);
      setFileName("");
    }
  };

  const cancelarTodo = () => {
    setFile(null);
    setFileName("");
    setColumnasDisponibles([]);
    setColumnaIdentificador("");
    setColumnaFecha("");
    setColumnaCodStatus("");
    setDatosProcesados([]);
    setResultados([]);
    setMostrarResultados(false);
    setProgress("");
    setError("");
    setFechaDefault(() => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    });
    setCodStatusDefault("");
    setTipoIdentificador("carven");
    setArchivoCargado(false);
    setResumenColumnas([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!file) {
      alert("Por favor, carga un archivo Excel");
      return;
    }

    if (!columnaIdentificador) {
      alert("Por favor, selecciona la columna para el identificador");
      return;
    }

    if (!columnaCodStatus) {
      alert("Por favor, selecciona la columna para COD STATUS");
      return;
    }

    const fechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (columnaFecha === "otro" && !fechaRegex.test(fechaDefault)) {
      alert("La fecha debe tener formato dd/mm/aaaa (ejemplo: 19/08/2026)");
      return;
    }

    if (columnaCodStatus === "otro") {
      if (!codStatusDefault || codStatusDefault.trim() === "") {
        alert("Por favor, ingresa un COD STATUS");
        return;
      }
    }

    // Procesar los datos
    const registros = datosProcesados
      .map((fila) => {
        const identificador =
          fila[columnaIdentificador]?.toString().trim() || "";

        let codStatus = "";
        if (columnaCodStatus === "otro") {
          codStatus = codStatusDefault;
        } else {
          codStatus =
            fila[columnaCodStatus]?.toString().trim() || codStatusDefault;
        }

        let fecha = fechaDefault;
        if (columnaFecha !== "otro") {
          const valor = fila[columnaFecha];
          // Si es un número serial de Excel, convertirlo a fecha usando UTC
          if (typeof valor === "number" && valor > 30000 && valor < 50000) {
            const fechaObj = new Date(Date.UTC(1899, 11, 30 + valor));
            const day = String(fechaObj.getUTCDate()).padStart(2, "0");
            const month = String(fechaObj.getUTCMonth() + 1).padStart(2, "0");
            const year = fechaObj.getUTCFullYear();
            fecha = `${day}/${month}/${year}`;
          } else if (valor) {
            const fechaStr = String(valor).trim();
            if (fechaRegex.test(fechaStr)) {
              fecha = fechaStr;
            }
          }
        }

        return { identificador, codStatus, fecha };
      })
      .filter((r) => r.identificador !== "" && r.codStatus !== "");

    if (registros.length === 0) {
      alert("No se encontraron registros válidos para procesar");
      return;
    }

    setLoading(true);
    setProgress(`Procesando ${registros.length} registros...`);
    setError("");
    setMostrarResultados(false);
    setResultados([]);

    try {
      const response = await fetch(
        "http://192.168.28.35:3002/devoluciones/procesar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo: tipoIdentificador, registros }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar las devoluciones");
      }

      setProgress(
        `✅ ${data.actualizados || registros.length} registros procesados correctamente`,
      );

      const resultadosFormateados = registros.map((item) => ({
        identificador: item.identificador,
        tipo: tipoIdentificador === "carven" ? "CARVEN" : "NUM CREDITO",
        status: item.codStatus,
        fecha: item.fecha,
        resultado: data.actualizadosLista?.includes(item.identificador)
          ? "Actualizado"
          : "No encontrado",
      }));

      setResultados(resultadosFormateados);
      setMostrarResultados(true);

      setTimeout(() => setProgress(""), 5000);

      setFile(null);
      setFileName("");
      setDatosProcesados([]);
      setColumnasDisponibles([]);
      setColumnaIdentificador("");
      setColumnaFecha("");
      setColumnaCodStatus("");
      setArchivoCargado(false);
      setResumenColumnas([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Error al procesar las devoluciones");
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

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devoluciones_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isProcesarDisabled = () => {
    if (loading) return true;
    if (!archivoCargado) return true;
    if (!columnaIdentificador) return true;
    if (!columnaCodStatus) return true;

    if (
      columnaCodStatus === "otro" &&
      (!codStatusDefault || codStatusDefault.trim() === "")
    ) {
      return true;
    }

    if (
      columnaFecha === "otro" &&
      (!fechaDefault || fechaDefault.trim() === "")
    ) {
      return true;
    }

    return false;
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
          maxWidth: "850px",
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
          Procesador de Devoluciones
        </h1>
        <p style={{ color: "#666", marginBottom: "25px", fontSize: "14px" }}>
          Actualiza status y fecha de devolución para múltiples registros
        </p>

        {/* Área de drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            background: isDragging ? "#fff3e0" : "#f8f9fa",
            borderRadius: "20px",
            padding: "25px 20px",
            border: isDragging ? "2px solid #ff6b35" : "2px dashed #dee2e6",
            marginBottom: "20px",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                background: isDragging ? "#ff6b35" : "#e9ecef",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: "24px" }}>
                {isDragging ? "📂" : "📁"}
              </span>
            </div>

            {fileName ? (
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    color: "#28a745",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  ✓ Archivo cargado:
                </span>
                <span
                  style={{
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "14px",
                    display: "block",
                    marginTop: "3px",
                  }}
                >
                  {fileName}
                </span>
                {columnasDisponibles.length > 0 && (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "3px",
                      display: "block",
                    }}
                  >
                    {columnasDisponibles.length} columnas con datos
                  </span>
                )}
              </div>
            ) : (
              <>
                <span
                  style={{
                    color: "#ff6b35",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Seleccionar o arrastrar archivo
                </span>
                <span style={{ fontSize: "12px", color: "#999" }}>
                  .xlsx o .xls
                </span>
              </>
            )}
          </div>
        </div>

        {/* Resumen de columnas con ejemplo */}
        {archivoCargado && resumenColumnas.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: "#f0f7ff",
              borderRadius: "10px",
              border: "1px solid #d0e0ff",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#1e3c72",
                marginBottom: "8px",
              }}
            >
              Columnas disponibles con datos:
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "4px",
                maxHeight: "200px",
                overflow: "auto",
              }}
            >
              {resumenColumnas.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: "12px",
                    padding: "6px 12px",
                    background: "#e8f5e9",
                    borderRadius: "6px",
                    border: "1px solid #a5d6a7",
                    color: "#2e7d32",
                    display: "grid",
                    gridTemplateColumns: "200px 70px 1fr",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "500" }}>{item.columna}</span>
                  <span style={{ fontWeight: "400", color: "#555" }}>
                    {item.registros} regs
                  </span>
                  <span
                    style={{
                      fontWeight: "400",
                      color: "#1a5a2a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "monospace",
                      fontSize: "11px",
                      backgroundColor: "rgba(255,255,255,0.5)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Muestra: {item.ejemplo || "(vacío)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selector de Tipo de Identificador */}
        {archivoCargado && (
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
              Tipo de Identificador: <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={tipoIdentificador}
              onChange={(e) => {
                setTipoIdentificador(e.target.value);
                setColumnaIdentificador("");
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "14px",
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <option value="carven">CARVEN</option>
              <option value="numcredito">NÚMERO DE CRÉDITO</option>
            </select>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
              {tipoIdentificador === "carven"
                ? "El identificador es DEACVEDEUDOR"
                : "El identificador es DEANUMCREDITO"}
            </div>
          </div>
        )}

        {/* Selectores de columnas */}
        {archivoCargado && columnasDisponibles.length > 0 && (
          <>
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
                {tipoIdentificador === "carven" ? "CARVEN" : "NUM CREDITO"}:{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <select
                value={columnaIdentificador}
                onChange={(e) => setColumnaIdentificador(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="">-- Selecciona una columna --</option>
                {columnasDisponibles.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

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
                FECHA: <span style={{ color: "red" }}>*</span>
              </label>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <select
                  value={columnaFecha}
                  onChange={(e) => setColumnaFecha(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Selecciona una columna --</option>
                  {columnasDisponibles.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                  <option value="otro">OTRA FECHA (especificar abajo)</option>
                </select>
                {columnaFecha === "otro" && (
                  <input
                    type="text"
                    value={fechaDefault}
                    onChange={(e) => setFechaDefault(e.target.value)}
                    placeholder="dd/mm/aaaa"
                    style={{
                      width: "150px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                )}
              </div>
              <div
                style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}
              >
                {columnaFecha === "otro"
                  ? "Formato: dd/mm/aaaa (ejemplo: 19/08/2026)"
                  : "Selecciona la columna que contiene la fecha de devolución"}
              </div>
            </div>

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
                COD STATUS: <span style={{ color: "red" }}>*</span>
              </label>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <select
                  value={columnaCodStatus}
                  onChange={(e) => setColumnaCodStatus(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Selecciona una columna --</option>
                  {columnasDisponibles.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                  <option value="otro">OTRO STATUS (especificar abajo)</option>
                </select>
                {columnaCodStatus === "otro" && (
                  <input
                    type="text"
                    value={codStatusDefault}
                    onChange={(e) => setCodStatusDefault(e.target.value)}
                    placeholder="Ej: 69"
                    style={{
                      width: "100px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      fontFamily: "monospace",
                    }}
                  />
                )}
              </div>
              <div
                style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}
              >
                {columnaCodStatus === "otro"
                  ? "Ingresa el código de status (solo números)"
                  : "Selecciona la columna que contiene el código de status"}
              </div>
            </div>
          </>
        )}

        {/* Botones */}
        {archivoCargado && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSubmit}
              disabled={isProcesarDisabled()}
              style={{
                flex: 1,
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
                "Procesar Devoluciones"
              )}
            </button>

            <button
              onClick={cancelarTodo}
              style={{
                padding: "14px 24px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#c82333")}
              onMouseLeave={(e) => (e.target.style.background = "#dc3545")}
            >
              Cancelar
            </button>
          </div>
        )}

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
                ✅ {resultados.length} registros procesados
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
                  style={{ background: "#f5f5f5", position: "sticky", top: 0 }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                      }}
                    >
                      {tipoIdentificador === "carven"
                        ? "CARVEN"
                        : "NUM CREDITO"}
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
                      Fecha
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
                        {item.identificador}
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
                      <td style={{ padding: "8px 12px", fontSize: "12px" }}>
                        {item.fecha}
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
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Devoluciones;
