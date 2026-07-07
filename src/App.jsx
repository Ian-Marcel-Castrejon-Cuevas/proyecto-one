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
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Estados globales - SIEMPRE VISIBLES
  const [tipoCliente, setTipoCliente] = useState("ATT");
  const [nombreEnvio, setNombreEnvio] = useState("");
  const [tipoPago, setTipoPago] = useState("P2");
  const [tipoSuscripcion, setTipoSuscripcion] = useState("SUS");
  const [fechaEnvio, setFechaEnvio] = useState(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(2);
    return `${day}${month}${year}`;
  });

  // Estado para la columna seleccionada (GENERAL para todos los archivos)
  const [columnaSeleccionada, setColumnaSeleccionada] = useState("");
  const [columnasDisponibles, setColumnasDisponibles] = useState([]);

  // Estado para validación de selecciones
  const [erroresValidacion, setErroresValidacion] = useState([]);

  // Estado para archivos pendientes de procesar
  const [archivosPendientes, setArchivosPendientes] = useState([]);

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
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error al borrar:", error);
        alert("Error de conexion con el servidor");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const irALeyendas = () => {
    navigate("/leyendas");
  };

  // Función para validar las selecciones (se llama al descargar)
  const validarSeleccionesParaDescarga = () => {
    const errores = [];

    if (!nombreEnvio || nombreEnvio.length === 0) {
      errores.push("El nombre de quien envía es obligatorio");
    } else if (nombreEnvio.length > 4) {
      errores.push("El nombre de quien envía debe tener máximo 4 caracteres");
    }

    if (!fechaEnvio || fechaEnvio.length !== 6 || !/^\d{6}$/.test(fechaEnvio)) {
      errores.push("La fecha debe tener formato DDMMYY");
    }

    if (tipoCliente === "ATT") {
      if (!tipoPago) {
        errores.push("Debes seleccionar un tipo de pago (P1 o P2)");
      }
      if (!tipoSuscripcion) {
        errores.push("Debes seleccionar un tipo de suscripción (SUS o CAN)");
      }
    }

    setErroresValidacion(errores);
    return errores.length === 0;
  };

  // Función para generar el nombre del archivo con los valores ACTUALES de los selectores
  const generarNombreArchivo = (nombreOriginal, horaArchivo) => {
    let nombreBase = "";

    // Tomar los valores ACTUALES de los selectores
    const nombreLimpio = nombreEnvio.toUpperCase().slice(0, 4) || "XXXX";
    const fechaActual = fechaEnvio || "000000";

    if (tipoCliente === "ATT") {
      nombreBase = `ATT_${fechaActual}_${nombreLimpio}_${tipoSuscripcion || "SUS"}_${tipoPago || "P2"}_${horaArchivo || "0000"}`;
    } else if (tipoCliente === "GMF") {
      nombreBase = `GMF_${fechaActual}_${nombreLimpio}_${horaArchivo || "0000"}`;
    } else if (tipoCliente === "TOYOTA") {
      nombreBase = `TYT_${fechaActual}_${nombreLimpio}_${horaArchivo || "0000"}`;
    } else {
      nombreBase = `VER_${fechaActual}_${nombreLimpio}_${horaArchivo || "0000"}`;
    }

    const extension = nombreOriginal.includes(".")
      ? nombreOriginal.split(".").pop()
      : "xlsx";
    return `${nombreBase}.${extension}`;
  };

  // Función para agregar metadatos al Excel (Autor: IAN)
  const agregarMetadatosExcel = (workbook) => {
    workbook.Props = {
      Title: "Verificacion de cuentas EDOMEX",
      Subject: "Resultados de verificacion",
      Author: "IAN",
      Manager: "IAN",
      Company: "IAN",
      Category: "Verificacion",
      Keywords: "EDOMEX, cuentas, verificacion",
      Comments: "Archivo generado automaticamente",
      LastAuthor: "IAN",
      CreatedDate: new Date(),
    };
    return workbook;
  };

  // Función para crear blob de Excel a partir de datos
  const crearExcelConResultados = (data) => {
    const resultadoData = data.map((row) => ({
      Clave: row.Clave || row.clave,
      CP: row.CP || row.cp,
      Municipio: row.Municipio || row.municipio,
      Estado: row.Estado || row.estado,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(resultadoData);
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");
    agregarMetadatosExcel(wb);

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      bookSST: false,
    });

    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return URL.createObjectURL(blob);
  };

  // Función para procesar archivo y extraer columnas
  const procesarArchivoParaColumnas = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const hoja = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(hoja);

          const columnas = Object.keys(json[0] || {});

          resolve({
            datos: json,
            columnas: columnas,
            workbook: workbook,
            file: file,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Función para procesar un archivo individual con la columna seleccionada
  const procesarArchivoConColumna = async (file) => {
    try {
      const resultado = await procesarArchivoParaColumnas(file);

      // Extraer los valores de la columna seleccionada
      const claves = resultado.datos
        .map((fila) => fila[columnaSeleccionada])
        .filter(Boolean);

      if (!claves || claves.length === 0) {
        alert(
          `No se encontraron datos en la columna "${columnaSeleccionada}" para el archivo: ${file.name}`,
        );
        return null;
      }

      const clavesLimpias = claves.map((r) => r.toString());

      const response = await fetch("http://192.168.28.35:3002/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claves: clavesLimpias }),
      });

      const data = await response.json();
      console.log("Respuesta del backend para", file.name, ":", data);

      // Crear Excel con resultados o archivo modificado
      let url = null;
      if (data.length > 0) {
        url = crearExcelConResultados(data);
      } else {
        // Si no hay resultados, devolver el archivo original sin la columna analizada
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(hoja, { defval: "" });

        // Eliminar la columna que fue analizada
        const nuevoJson = json.map((fila) => {
          const { [columnaSeleccionada]: columnaEliminada, ...resto } = fila;
          return resto;
        });

        const nuevaHoja = XLSX.utils.json_to_sheet(nuevoJson);
        workbook.Sheets[workbook.SheetNames[0]] = nuevaHoja;
        agregarMetadatosExcel(workbook);

        const wbout = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
          bookSST: false,
        });
        const blob = new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        url = URL.createObjectURL(blob);
      }

      return {
        nombre: file.name,
        resultado: data,
        url: url,
        columnaUsada: columnaSeleccionada,
      };
    } catch (error) {
      console.error("Error procesando archivo:", error);
      return null;
    }
  };

  const manejarArchivo = async (event) => {
    const files = event.target.files;
    if (!files) return;

    // Limpiar resultados anteriores
    setArchivosProcesados([]);
    setTieneResultados(false);
    setColumnasDisponibles([]);
    setColumnaSeleccionada("");
    setArchivosPendientes([]);

    // Procesar el primer archivo para obtener las columnas
    const primerArchivo = files[0];
    try {
      const resultado = await procesarArchivoParaColumnas(primerArchivo);

      // Guardar todas las columnas disponibles (las del primer archivo)
      setColumnasDisponibles(resultado.columnas);
      if (resultado.columnas.length > 0) {
        setColumnaSeleccionada(resultado.columnas[0]);
      }

      // Guardar todos los archivos para procesar después
      setArchivosPendientes(Array.from(files));

      alert(
        `Archivos cargados: ${files.length}\nColumna detectada: ${resultado.columnas[0] || "Ninguna"}\n\nSelecciona la columna que deseas analizar y presiona "Verificar archivos"`,
      );
    } catch (error) {
      console.error("Error procesando archivo:", error);
      alert(`Error al procesar el archivo: ${primerArchivo.name}`);
    }
  };

  // Función para verificar TODOS los archivos con la columna seleccionada
  const verificarArchivosConColumna = async () => {
    if (!columnaSeleccionada) {
      alert("Por favor selecciona una columna para analizar");
      return;
    }

    if (archivosPendientes.length === 0) {
      alert("No hay archivos para procesar");
      return;
    }

    setArchivosProcesados([]);
    setTieneResultados(false);
    setIsLoading(true);

    const resultados = [];

    // Procesar cada archivo con la MISMA columna seleccionada
    for (let i = 0; i < archivosPendientes.length; i++) {
      const file = archivosPendientes[i];
      const resultado = await procesarArchivoConColumna(file);

      if (resultado) {
        // Pedir hora para este archivo
        const horaIngresada = prompt(
          `Ingresa la hora para el archivo "${file.name}"\nFormato: HHMM (ejemplo: 1245)`,
          "",
        );

        let hora = "";
        let nombreDescarga = "";
        if (horaIngresada && /^\d{4}$/.test(horaIngresada)) {
          hora = horaIngresada;
          // El nombre se genera al descargar con los valores ACTUALES
          nombreDescarga = generarNombreArchivo(file.name, horaIngresada);
        } else if (horaIngresada !== null) {
          alert("Hora invalida. Puedes editarla manualmente.");
        }

        resultados.push({
          nombre: file.name,
          resultado: resultado.resultado,
          archivoDescargable: resultado.url,
          hora: hora,
          necesitaHora: !hora,
          nombreDescarga: nombreDescarga,
          esManual: false,
          columnaUsada: columnaSeleccionada,
        });
      }
    }

    // Actualizar el estado con todos los resultados
    setArchivosProcesados(resultados);
    setTieneResultados(true);
    setIsLoading(false);

    // Limpiar archivos pendientes
    setArchivosPendientes([]);
  };

  const abrirSelectorArchivos = () => {
    setArchivosProcesados([]);
    setTieneResultados(false);
    setShowTextArea(false);
    setCarvenNumbers("");
    setColumnasDisponibles([]);
    setColumnaSeleccionada("");
    setArchivosPendientes([]);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const cancelarCarga = () => {
    setArchivosProcesados([]);
    setTieneResultados(false);
    setShowTextArea(false);
    setCarvenNumbers("");
    setColumnasDisponibles([]);
    setColumnaSeleccionada("");
    setArchivosPendientes([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const descargarTodos = () => {
    // Validar selecciones con los valores ACTUALES
    if (!validarSeleccionesParaDescarga()) {
      alert("Por favor corrige los errores:\n" + erroresValidacion.join("\n"));
      return;
    }

    // Validar que todos los archivos tengan hora
    const archivosSinHora = archivosProcesados.filter(
      (item) =>
        !item.hora || item.hora.length !== 4 || !/^\d{4}$/.test(item.hora),
    );

    if (archivosSinHora.length > 0) {
      alert(
        "Los siguientes archivos no tienen hora valida:\n" +
          archivosSinHora.map((item) => `- ${item.nombre}`).join("\n") +
          "\n\nPor favor, asigna una hora a cada archivo antes de descargar.",
      );
      return;
    }

    // Descargar cada archivo con el nombre GENERADO EN EL MOMENTO
    archivosProcesados.forEach((item) => {
      if (item.archivoDescargable) {
        const link = document.createElement("a");
        link.href = item.archivoDescargable;
        // Generar el nombre en el momento de la descarga con los valores ACTUALES
        const nombreDescarga = generarNombreArchivo(item.nombre, item.hora);
        link.download = nombreDescarga;
        link.click();
      }
    });
  };

  const manejarTextoManual = () => {
    const numbers = carvenNumbers
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    if (numbers.length === 0) {
      alert("Por favor ingresa al menos un numero");
      return;
    }

    const clavesLimpias = numbers.map((r) => r.toString());
    verificarCuentasManual(clavesLimpias);
  };

  // Función para verificación manual sin validar selectores
  const verificarCuentasManual = async (claves) => {
    try {
      setIsLoading(true);

      const response = await fetch("http://192.168.28.35:3002/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claves: claves }),
      });

      const data = await response.json();
      console.log("Respuesta del backend manual:", data);

      let url = null;
      if (data.length > 0) {
        url = crearExcelConResultados(data);
      }

      const horaActual = new Date();
      const hora = String(horaActual.getHours()).padStart(2, "0");
      const minutos = String(horaActual.getMinutes()).padStart(2, "0");
      const horaDefault = hora + minutos;

      let nuevoResultado = {
        nombre: "Busqueda manual",
        resultado: data,
        hora: horaDefault,
        necesitaHora: false,
        autor: "IAN",
        esManual: true,
        archivoDescargable: url,
        nombreDescarga: "", // Se genera al descargar
        columnaUsada: "Manual",
      };

      setShowTextArea(false);
      setCarvenNumbers("");

      setArchivosProcesados([nuevoResultado]);
      setTieneResultados(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al verificar:", error);
      alert("Error al verificar las cuentas");
      setIsLoading(false);
    }
  };

  // Función para actualizar el nombre de descarga cuando cambia la hora
  const actualizarHoraArchivo = (index, valor) => {
    const nuevosArchivos = [...archivosProcesados];
    nuevosArchivos[index].hora = valor;
    if (valor.length === 4 && /^\d{4}$/.test(valor)) {
      // No generamos nombre aquí, se genera al descargar
      nuevosArchivos[index].nombreDescarga = "";
    }
    setArchivosProcesados(nuevosArchivos);
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
          <h1>Verificacion de cuentas EDO MEX</h1>
          <p className="subtitle">
            Carga archivos o ingresa numeros manualmente
          </p>
        </div>

        {/* Panel de selectores - SIEMPRE VISIBLES para que puedas modificarlos */}
        <div className="selectors-panel">
          <div className="selector-group">
            <label>Cliente</label>
            <select
              value={tipoCliente}
              onChange={(e) => setTipoCliente(e.target.value)}
            >
              <option value="ATT">ATT</option>
              <option value="GMF">GMF</option>
              <option value="TOYOTA">TOYOTA</option>
            </select>
          </div>

          <div className="selector-group">
            <label>Quien envia?</label>
            <input
              type="text"
              maxLength="4"
              value={nombreEnvio}
              onChange={(e) => setNombreEnvio(e.target.value.toUpperCase())}
              placeholder="Ej: EMA"
            />
          </div>

          <div className="selector-group">
            <label>Fecha (DDMMYY)</label>
            <input
              type="text"
              maxLength="6"
              value={fechaEnvio}
              onChange={(e) => setFechaEnvio(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 070726"
            />
          </div>

          {/* Selectores condicionales para ATT */}
          {tipoCliente === "ATT" && (
            <>
              <div className="selector-group">
                <label>P1 / P2</label>
                <select
                  value={tipoPago}
                  onChange={(e) => setTipoPago(e.target.value)}
                >
                  <option value="P1">P1</option>
                  <option value="P2">P2</option>
                </select>
              </div>

              <div className="selector-group">
                <label>SUS / CAN</label>
                <select
                  value={tipoSuscripcion}
                  onChange={(e) => setTipoSuscripcion(e.target.value)}
                >
                  <option value="SUS">SUS</option>
                  <option value="CAN">CAN</option>
                </select>
              </div>
            </>
          )}

          {/* Selector de columna - GENERAL para todos los archivos */}
          {columnasDisponibles.length > 0 && (
            <div className="selector-group">
              <label>Columna a analizar</label>
              <select
                value={columnaSeleccionada}
                onChange={(e) => setColumnaSeleccionada(e.target.value)}
              >
                {columnasDisponibles.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              {archivosPendientes.length > 1 && (
                <span
                  style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}
                ></span>
              )}
            </div>
          )}
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
            Anadir archivos
          </button>

          {/* Botón para verificar TODOS los archivos con la columna seleccionada */}
          {columnasDisponibles.length > 0 && archivosPendientes.length > 0 && (
            <button
              className="btn btn-success"
              onClick={verificarArchivosConColumna}
              disabled={isLoading}
            >
              {isLoading
                ? "Verificando..."
                : `Verificar ${archivosPendientes.length} archivo(s)`}
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowTextArea(!showTextArea);
              if (!showTextArea) {
                setArchivosProcesados([]);
                setTieneResultados(false);
              }
            }}
          >
            Buscar manual
          </button>

          <button className="btn btn-outline" onClick={cancelarCarga}>
            Cancelar
          </button>
        </div>

        {showTextArea && (
          <div className="manual-panel">
            <div style={{ width: "100%", maxWidth: "500px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#495057",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Ingresa los numeros (uno por linea):
              </label>
              <textarea
                className="manual-textarea"
                rows={6}
                value={carvenNumbers}
                onChange={(e) => setCarvenNumbers(e.target.value)}
                placeholder=""
                style={{ width: "100%" }}
              />
              <button
                className="btn btn-success"
                onClick={manejarTextoManual}
                disabled={isLoading}
                style={{ marginTop: "12px", width: "100%" }}
              >
                {isLoading ? "Verificando..." : "Verificar numeros"}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowTextArea(false);
                  setCarvenNumbers("");
                }}
                style={{ marginTop: "8px", width: "100%" }}
              >
                Cancelar busqueda
              </button>
            </div>
          </div>
        )}

        {tieneResultados && archivosProcesados.length > 0 && (
          <div className="results">
            <div className="results-header">
              <h2>Resultados</h2>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  className="btn btn-download-all"
                  onClick={descargarTodos}
                >
                  Descargar todos
                </button>
              </div>
            </div>

            {archivosProcesados.map((item, index) => (
              <div key={index} className="card">
                <div className="card-header">
                  <span className="card-icon">{item.esManual ? "⌨" : ""}</span>
                  <span className="card-title">{item.nombre}</span>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {!item.esManual && (
                      <>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginRight: "4px",
                          }}
                        >
                          Hora:
                        </span>
                        <input
                          type="text"
                          maxLength="4"
                          placeholder="HHMM"
                          value={item.hora || ""}
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, "");
                            actualizarHoraArchivo(index, valor);
                          }}
                          style={{
                            width: "60px",
                            padding: "4px 8px",
                            border: "2px solid #e9ecef",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontFamily: "monospace",
                            textAlign: "center",
                          }}
                        />
                      </>
                    )}
                    {item.archivoDescargable && (
                      <a
                        href={item.archivoDescargable}
                        download={generarNombreArchivo(item.nombre, item.hora)}
                        className="btn-download"
                        style={{ fontSize: "12px", padding: "6px 14px" }}
                      >
                        Descargar
                      </a>
                    )}
                    {!item.archivoDescargable && (
                      <span style={{ fontSize: "12px", color: "#999" }}>
                        Sin resultados
                      </span>
                    )}
                  </div>
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
                    <span className="empty-icon"></span>
                    <p>No se encuentran cuentas EDOMEX</p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        marginTop: "8px",
                      }}
                    >
                      {item.esManual
                        ? "Los numeros ingresados no tienen resultados"
                        : `La columna "${item.columnaUsada || "seleccionada"}" no contiene cuentas EDOMEX`}
                    </p>
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
