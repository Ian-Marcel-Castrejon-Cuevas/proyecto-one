export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";
export const API_URL = import.meta.env.VITE_API_URL || "/api";

export const demoVerificar = (claves) =>
  claves.map((clave, index) => ({
    Clave: String(clave),
    CP: `5000${String((index % 9) + 1).padStart(1, "0")}`,
    Municipio: ["Toluca", "Metepec", "Zinacantepec"][index % 3],
    Estado: "Estado de Mexico",
  }));

export const demoActualizarStatus = (claves, status) => ({
  actualizadas: claves.length,
  totalEnviadas: claves.length,
  clavesActualizadas: claves,
  status,
});

export const demoProcesarDevoluciones = (registros) => ({
  actualizados: registros.length,
  actualizadosLista: registros.map((registro) => registro.identificador),
});
