import { useState, useRef, useEffect } from "react";

function Leyendas() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [bancoSeleccionado, setBancoSeleccionado] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [downloadInfo, setDownloadInfo] = useState(null);
  const [currentDownloading, setCurrentDownloading] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = "http://192.168.28.35:3002";

  const extractFilesFromZip = async (zipFile) => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    try {
      const contents = await zip.loadAsync(zipFile);
      const excelFiles = [];

      for (const [filename, fileData] of Object.entries(contents.files)) {
        if (
          !fileData.dir &&
          (filename.endsWith(".xlsx") || filename.endsWith(".xls"))
        ) {
          const blob = await fileData.async("blob");
          const extractedFile = new File([blob], filename.split("/").pop(), {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          excelFiles.push(extractedFile);
        }
      }

      return excelFiles;
    } catch (error) {
      console.error("Error leyendo ZIP:", error);
      return [];
    }
  };

  const processFile = async (selectedFile) => {
    const name = selectedFile.name;
    const extension = name.split(".").pop()?.toLowerCase();

    if (extension === "zip") {
      setProgress("Extrayendo archivos del ZIP...");
      try {
        const excelFiles = await extractFilesFromZip(selectedFile);

        if (excelFiles.length === 0) {
          alert(
            "No se encontraron archivos Excel (.xlsx o .xls) dentro del ZIP",
          );
          setFile(null);
          setFileName("");
          setProgress("");
          return;
        }

        if (excelFiles.length > 1) {
          alert(
            `Se encontraron ${excelFiles.length} archivos Excel. Se procesará el primero: ${excelFiles[0].name}`,
          );
        }

        const firstExcel = excelFiles[0];
        setFile(firstExcel);
        setFileName(`${firstExcel.name} (extraído de ${name})`);
        setError("");
        setProgress(`Archivo extraído: ${firstExcel.name}`);
      } catch (err) {
        alert("Error al leer el archivo ZIP");
        setFile(null);
        setFileName("");
        setProgress("");
      }
      return;
    }

    if (extension === "xlsx" || extension === "xls") {
      setFile(selectedFile);
      setFileName(name);
      setError("");
      setProgress("");
    } else {
      alert(
        "Formato no soportado. Arrastra un archivo Excel (.xlsx o .xls) o un ZIP que contenga Excel",
      );
      setFile(null);
      setFileName("");
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      const response = await fetch(`${API_URL}${url}`);
      if (!response.ok) {
        throw new Error(`Error descargando ${filename}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (error) {
      console.error(`Error descargando ${filename}:`, error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!bancoSeleccionado) {
      alert("Por favor, selecciona una empresa/cartera");
      return;
    }

    if (!tipoSeleccionado) {
      alert("Por favor, selecciona el tipo de archivo (Leyendas o Gestiones)");
      return;
    }

    if (!file) {
      alert("Selecciona un archivo Excel");
      return;
    }

    setLoading(true);
    setProgress("Subiendo archivo...");
    setError("");
    setDownloadInfo(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("banco", bancoSeleccionado);
    formData.append("tipo", tipoSeleccionado);

    try {
      const response = await fetch(`${API_URL}/leyendas/procesar`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar");
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (data.multipleFiles) {
          setDownloadInfo(data);
          setProgress(
            `Se generaron ${data.totalArchivos} archivos. Iniciando descarga...`,
          );

          let successCount = 0;
          for (let i = 0; i < data.files.length; i++) {
            const file = data.files[i];
            setCurrentDownloading({
              current: i + 1,
              total: data.files.length,
              name: file.name,
            });
            setProgress(
              `Descargando archivo ${i + 1} de ${data.files.length}: ${file.name}`,
            );

            const success = await downloadFile(file.downloadUrl, file.name);
            if (success) {
              successCount++;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          setCurrentDownloading(null);
          setProgress(
            `¡Completado! Se descargaron ${successCount} de ${data.files.length} archivos.`,
          );

          setTimeout(() => {
            if (progress.includes("Completado")) {
              setProgress("");
              setDownloadInfo(null);
            }
          }, 5000);
        }
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const fecha = new Date();
        const dia = fecha.getDate().toString().padStart(2, "0");
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const anio = fecha.getFullYear().toString().slice(-2);
        const fechaStr = `${dia}${mes}${anio}`;

        let nombreBanco = "";
        if (bancoSeleccionado === "SCOTIABANK") nombreBanco = "SCOT";
        else if (bancoSeleccionado === "BBVA") nombreBanco = "BBVA";
        else if (bancoSeleccionado === "ATT") nombreBanco = "ATT";
        else if (bancoSeleccionado === "GMF") nombreBanco = "GMF";
        else if (bancoSeleccionado === "TOYOTA") nombreBanco = "TOYOTA";
        else nombreBanco = bancoSeleccionado;

        let prefijo = tipoSeleccionado === "LEYENDAS" ? "LEY_" : "GES_";
        a.download = `${prefijo}${nombreBanco}_${fechaStr}.xls`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setProgress(`¡Completado! Archivo descargado.`);

        setTimeout(() => {
          if (progress.includes("Completado")) {
            setProgress("");
          }
        }, 5000);
      }

      setFile(null);
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err.message);
      setProgress("");
      setDownloadInfo(null);
    } finally {
      setLoading(false);
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
          maxWidth: "550px",
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
            marginBottom: "10px",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          Procesador de Archivos
        </h1>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Divide en partes de 64,999 registros | Formato Excel 97-2003
        </p>

        {/* Selector de Empresa/Cartera */}
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
            Elige la cartera: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={bancoSeleccionado}
            onChange={(e) => setBancoSeleccionado(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
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
            📋 Tipo de archivo: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
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
            padding: "40px 30px",
            border: isDragging ? "2px solid #ff6b35" : "2px dashed #dee2e6",
            marginBottom: "20px",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
        >
          <input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            accept=".xlsx,.xls,.zip"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                background: isDragging ? "#ff6b35" : "#e9ecef",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{ fontSize: "32px" }}>
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
                    marginTop: "5px",
                  }}
                >
                  {fileName}
                </span>
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
                  .xlsx, .xls o .zip (con Excel dentro)
                </span>
              </>
            )}

            {isDragging && (
              <span
                style={{
                  fontSize: "13px",
                  color: "#ff6b35",
                  fontWeight: "500",
                  marginTop: "5px",
                }}
              >
                Suelta el archivo aquí
              </span>
            )}
          </div>
        </div>

        {/* Información de descarga múltiple */}
        {downloadInfo && (
          <div
            style={{
              marginBottom: "15px",
              padding: "12px",
              background: "#e3f2fd",
              borderRadius: "10px",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Información del procesamiento:
            </div>
            <div>Total archivos: {downloadInfo.totalArchivos}</div>
            <div>
              Total registros: {downloadInfo.totalRegistros?.toLocaleString()}
            </div>
            {downloadInfo.files.map((file, idx) => (
              <div
                key={idx}
                style={{ fontSize: "11px", marginTop: "4px", color: "#666" }}
              >
                • {file.name}: {file.registros?.toLocaleString()} registros
              </div>
            ))}
          </div>
        )}

        {/* Barra de progreso de descarga múltiple */}
        {currentDownloading && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              background: "#fff3e0",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              <span>Descargando...</span>
              <span>
                {currentDownloading.current} / {currentDownloading.total}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "#e0e0e0",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(currentDownloading.current / currentDownloading.total) * 100}%`,
                  height: "100%",
                  background: "#ff6b35",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "11px", marginTop: "5px", color: "#666" }}>
              {currentDownloading.name}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !file || !bancoSeleccionado || !tipoSeleccionado}
          style={{
            width: "100%",
            padding: "16px",
            background:
              loading || !file || !bancoSeleccionado || !tipoSeleccionado
                ? "#ccc"
                : "linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor:
              loading || !file || !bancoSeleccionado || !tipoSeleccionado
                ? "not-allowed"
                : "pointer",
            transition: "all 0.3s ease",
            boxShadow:
              loading || !file || !bancoSeleccionado || !tipoSeleccionado
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
            "Procesar y Descargar"
          )}
        </button>

        {progress && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background:
                progress.includes("Completado") || progress.includes("")
                  ? "#e8f5e9"
                  : "#fff3e0",
              borderRadius: "10px",
              fontSize: "13px",
              color:
                progress.includes("Completado") || progress.includes("")
                  ? "#2e7d32"
                  : "#e65100",
              borderLeft:
                progress.includes("Completado") || progress.includes("")
                  ? "3px solid #2e7d32"
                  : "3px solid #ff6b35",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>
                {progress.includes("Completado") || progress.includes("")
                  ? ""
                  : ""}
              </span>
              <span>{progress}</span>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "#ffebee",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#c62828",
              borderLeft: "3px solid #c62828",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span></span>
              <span>{error}</span>
            </div>
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
