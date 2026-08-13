import { useState, useRef } from "react";
import * as XLSX from "xlsx";

function Leyendas() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Selectores principales
  const [carteraSeleccionada, setCarteraSeleccionada] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(2);
    return `${day}${month}${year}`;
  });

  // Selector específico para GMF
  const [tipoGMF, setTipoGMF] = useState("HER");

  // Columnas del archivo - "Columnas a texto"
  const [columnasDisponibles, setColumnasDisponibles] = useState([]);
  const [columnasTexto, setColumnasTexto] = useState([]);

  // Estado para el procesamiento
  const [archivosGenerados, setArchivosGenerados] = useState([]);
  const [mostrarDescargas, setMostrarDescargas] = useState(false);

  const fileInputRef = useRef(null);

  // Procesar el archivo para obtener las columnas
  const procesarArchivoParaColumnas = async (selectedFile) => {
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(hoja);

      if (json.length > 0) {
        const columnas = Object.keys(json[0]);
        setColumnasDisponibles(columnas);
        // Seleccionar TODAS las columnas por defecto
        setColumnasTexto(columnas);
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
      setMostrarDescargas(false);
      setArchivosGenerados([]);

      const success = await procesarArchivoParaColumnas(selectedFile);
      if (!success) {
        setError("No se pudieron leer las columnas del archivo");
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
    setColumnasTexto([]);
    setArchivosGenerados([]);
    setMostrarDescargas(false);
    setProgress("");
    setError("");
    setCarteraSeleccionada("");
    setTipoSeleccionado("");
    setTipoGMF("HER");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generarNombreArchivo = (index, total) => {
    let prefijo = tipoSeleccionado === "LEYENDAS" ? "LEY" : "GEST";
    let cartera = "";
    let extra = "";

    switch (carteraSeleccionada) {
      case "SCOTIABANK":
        cartera = "SCOT";
        break;
      case "BBVA":
        cartera = "BBVA";
        break;
      case "ATT":
        cartera = "ATT";
        break;
      case "GMF":
        cartera = "GMF";
        extra = `_${tipoGMF}`;
        break;
      case "TOYOTA":
        cartera = "TYT";
        break;
      default:
        cartera = carteraSeleccionada;
    }

    const numeroArchivo = total > 1 ? `_${index + 1}` : "";
    return `${prefijo}_${cartera}${extra}_${fechaSeleccionada}${numeroArchivo}.xls`;
  };

  const crearHojaConFormatoTexto = (datos, columnasTexto) => {
    const ws = XLSX.utils.json_to_sheet(datos);

    if (columnasTexto.length > 0 && datos.length > 0) {
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      const encabezados = Object.keys(datos[0]);
      const indicesColumnasTexto = [];

      columnasTexto.forEach((col) => {
        const idx = encabezados.indexOf(col);
        if (idx !== -1) {
          indicesColumnasTexto.push(idx);
        }
      });

      if (indicesColumnasTexto.length > 0) {
        for (let r = range.s.r; r <= range.e.r; r++) {
          for (let c = 0; c < indicesColumnasTexto.length; c++) {
            const colIdx = indicesColumnasTexto[c];
            const cellRef = XLSX.utils.encode_cell({ r: r, c: colIdx });

            if (ws[cellRef]) {
              if (ws[cellRef].v !== undefined && ws[cellRef].v !== null) {
                ws[cellRef].v = String(ws[cellRef].v);
              }
              ws[cellRef].t = "s";
              ws[cellRef].z = "@";
            }
          }
        }
      }
    }

    return ws;
  };

  const handleSubmit = async () => {
    if (!carteraSeleccionada) {
      alert("Por favor, selecciona una cartera");
      return;
    }

    if (!tipoSeleccionado) {
      alert("Por favor, selecciona el tipo de archivo (Leyendas o Gestiones)");
      return;
    }

    if (
      !fechaSeleccionada ||
      fechaSeleccionada.length !== 6 ||
      !/^\d{6}$/.test(fechaSeleccionada)
    ) {
      alert(
        "Por favor, ingresa una fecha valida en formato DDMMYY (ejemplo: 070726)",
      );
      return;
    }

    if (!file) {
      alert("Selecciona un archivo Excel");
      return;
    }

    if (columnasTexto.length === 0) {
      alert("Selecciona al menos una columna a texto");
      return;
    }

    setLoading(true);
    setProgress("Procesando archivo...");
    setError("");
    setArchivosGenerados([]);
    setMostrarDescargas(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(hoja, {
        defval: "",
        raw: true,
      });

      if (jsonData.length === 0) {
        throw new Error("El archivo esta vacio");
      }

      const datosProcesados = jsonData.map((fila) => {
        const nuevaFila = {};
        for (const columna of Object.keys(fila)) {
          let valor = fila[columna];

          if (columnasTexto.includes(columna)) {
            if (valor !== undefined && valor !== null) {
              if (typeof valor === "number") {
                valor = valor.toString();
              } else if (typeof valor === "string") {
                valor = valor;
              } else {
                valor = String(valor);
              }
            } else {
              valor = "";
            }
          }

          nuevaFila[columna] = valor;
        }
        return nuevaFila;
      });

      const MAX_REGISTROS = 64999;
      const totalRegistros = datosProcesados.length;
      const totalArchivos = Math.ceil(totalRegistros / MAX_REGISTROS);

      setProgress(
        `Dividiendo ${totalRegistros} registros en ${totalArchivos} archivos...`,
      );

      const archivosGeneradosTemp = [];

      for (let i = 0; i < totalArchivos; i++) {
        const inicio = i * MAX_REGISTROS;
        const fin = Math.min(inicio + MAX_REGISTROS, totalRegistros);
        const chunk = datosProcesados.slice(inicio, fin);

        const nuevoWorkbook = XLSX.utils.book_new();
        const nuevaHoja = crearHojaConFormatoTexto(chunk, columnasTexto);
        XLSX.utils.book_append_sheet(nuevoWorkbook, nuevaHoja, "Hoja1");

        const wbout = XLSX.write(nuevoWorkbook, {
          bookType: "xls",
          type: "array",
          bookSST: false,
          cellStyles: true,
        });

        const blob = new Blob([wbout], {
          type: "application/vnd.ms-excel",
        });

        const url = URL.createObjectURL(blob);
        const nombreArchivo = generarNombreArchivo(i, totalArchivos);

        archivosGeneradosTemp.push({
          nombre: nombreArchivo,
          url: url,
          registros: chunk.length,
          index: i + 1,
        });

        setProgress(`Generando archivo ${i + 1} de ${totalArchivos}...`);
      }

      setArchivosGenerados(archivosGeneradosTemp);
      setMostrarDescargas(true);
      setProgress(`Completado! Se generaron ${totalArchivos} archivos.`);

      setTimeout(() => {
        setProgress("");
      }, 5000);

      setFile(null);
      setFileName("");
      setColumnasDisponibles([]);
      setColumnasTexto([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message || "Error al procesar el archivo");
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = (archivo) => {
    const link = document.createElement("a");
    link.href = archivo.url;
    link.download = archivo.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const descargarTodos = () => {
    archivosGenerados.forEach((archivo, index) => {
      setTimeout(() => {
        descargarArchivo(archivo);
      }, index * 300);
    });
  };

  const toggleColumnaTexto = (columna) => {
    if (columnasTexto.includes(columna)) {
      setColumnasTexto(columnasTexto.filter((c) => c !== columna));
    } else {
      setColumnasTexto([...columnasTexto, columna]);
    }
  };

  const toggleTodasColumnasTexto = () => {
    if (columnasTexto.length === columnasDisponibles.length) {
      setColumnasTexto([]);
    } else {
      setColumnasTexto([...columnasDisponibles]);
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

  const isProcesarDisabled = () => {
    return (
      loading ||
      !file ||
      !carteraSeleccionada ||
      !tipoSeleccionado ||
      !fechaSeleccionada ||
      columnasTexto.length === 0
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
          Procesador de Archivos
        </h1>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Divide en partes de 64,999 registros | Formato Excel 97-2003
        </p>

        {/* Selector de Cartera */}
        <div style={{ marginBottom: "12px", textAlign: "left" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Cartera: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={carteraSeleccionada}
            onChange={(e) => setCarteraSeleccionada(e.target.value)}
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
            <option value="">-- Seleccione una cartera --</option>
            <option value="SCOTIABANK">Scotiabank</option>
            <option value="BBVA">BBVA</option>
            <option value="ATT">ATT</option>
            <option value="GMF">GMF</option>
            <option value="TOYOTA">Toyota</option>
          </select>
        </div>

        {/* Selector de Tipo de Archivo */}
        <div style={{ marginBottom: "12px", textAlign: "left" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Tipo de archivo: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
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
            <option value="">-- Seleccione un tipo --</option>
            <option value="LEYENDAS">Leyendas</option>
            <option value="GESTIONES">Gestiones</option>
          </select>
        </div>

        {/* Selector de Fecha */}
        <div style={{ marginBottom: "12px", textAlign: "left" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: "#333",
              display: "block",
              marginBottom: "5px",
            }}
          >
            Fecha (DDMMYY): <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            maxLength="6"
            value={fechaSeleccionada}
            onChange={(e) =>
              setFechaSeleccionada(e.target.value.replace(/\D/g, ""))
            }
            placeholder="Ej: 070726"
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
        </div>

        {/* Selector específico para GMF */}
        {carteraSeleccionada === "GMF" && (
          <div style={{ marginBottom: "12px", textAlign: "left" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#333",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Tipo GMF: <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={tipoGMF}
              onChange={(e) => setTipoGMF(e.target.value)}
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
              <option value="HER">HER</option>
              <option value="VIS">VIS</option>
              <option value="DEV">DEV</option>
            </select>
          </div>
        )}

        {/* Selector de Columnas a Texto */}
        {columnasDisponibles.length > 0 && (
          <div style={{ marginBottom: "15px", textAlign: "left" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Columnas a texto: <span style={{ color: "red" }}>*</span>
              </label>
              <button
                onClick={toggleTodasColumnasTexto}
                style={{
                  fontSize: "12px",
                  padding: "4px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  background: "#f8f9fa",
                  cursor: "pointer",
                }}
              >
                {columnasTexto.length === columnasDisponibles.length
                  ? "Deseleccionar todas"
                  : "Seleccionar todas"}
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                maxHeight: "120px",
                overflowY: "auto",
                padding: "10px",
                background: "#f8f9fa",
                borderRadius: "10px",
                border: "1px solid #e9ecef",
              }}
            >
              {columnasDisponibles.map((col) => (
                <label
                  key={col}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: "4px 10px",
                    background: columnasTexto.includes(col)
                      ? "#e3f2fd"
                      : "#fff",
                    borderRadius: "6px",
                    border: columnasTexto.includes(col)
                      ? "1px solid #1976d2"
                      : "1px solid #e9ecef",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={columnasTexto.includes(col)}
                    onChange={() => toggleColumnaTexto(col)}
                    style={{ cursor: "pointer" }}
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
              {columnasTexto.length} de {columnasDisponibles.length} columnas se
              guardaran como texto
            </div>
          </div>
        )}

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
            padding: "35px 25px",
            border: isDragging ? "2px solid #ff6b35" : "2px dashed #dee2e6",
            marginBottom: "15px",
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
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                background: isDragging ? "#ff6b35" : "#e9ecef",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: "28px" }}>
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
                  ✓ Archivo seleccionado:
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
                    {columnasDisponibles.length} columnas detectadas
                  </span>
                )}
              </div>
            ) : (
              <>
                <span
                  style={{
                    color: "#ff6b35",
                    fontWeight: "500",
                    fontSize: "15px",
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

        {/* Botones de acción */}
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
              "Procesar"
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

        {/* Archivos generados */}
        {mostrarDescargas && archivosGenerados.length > 0 && (
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              background: "#e8f5e9",
              borderRadius: "12px",
              border: "1px solid #c8e6c9",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#2e7d32",
              }}
            >
              {archivosGenerados.length} archivo(s) generado(s):
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {archivosGenerados.map((archivo, idx) => (
                <button
                  key={idx}
                  onClick={() => descargarArchivo(archivo)}
                  style={{
                    padding: "6px 14px",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#388e3c")}
                  onMouseLeave={(e) => (e.target.style.background = "#4caf50")}
                >
                  {archivo.nombre}
                </button>
              ))}
            </div>
            <button
              onClick={descargarTodos}
              style={{
                marginTop: "10px",
                padding: "8px 20px",
                background: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#1565c0")}
              onMouseLeave={(e) => (e.target.style.background = "#1976d2")}
            >
              Descargar todos
            </button>
          </div>
        )}

        {progress && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px 14px",
              background: progress.includes("Completado")
                ? "#e8f5e9"
                : "#fff3e0",
              borderRadius: "10px",
              fontSize: "13px",
              color: progress.includes("Completado") ? "#2e7d32" : "#e65100",
              borderLeft: progress.includes("Completado")
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
            <span>{error}</span>
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

export default Leyendas;
