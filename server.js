const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/verificar", async (req, res) => {
  const { claves } = req.body;

  if (!claves || claves.length === 0) {
    return res.status(400).json({ error: "No se enviaron claves" });
  }

  try {
    const query = `
      SELECT  
        tbdeudor.deacvedeudor AS Clave,
        tbdirecciones.diacodpostal AS CP,
        tbmunicipios.cpanommunicipio AS Municipio,
        tbestados.cpanombre AS Estado
      FROM tbdirecciones
      JOIN tbmunicipios ON tbmunicipios.cpacvemunicipio = tbdirecciones.cpacvemunicipio
      JOIN tbestados ON tbestados.cpacveestado = tbdirecciones.cpacveestado
      JOIN tbdeudor ON tbdeudor.deacvedeudor = tbdirecciones.deacvedeudor
      WHERE tbestados.cpacveestado = '15'
        AND tbmunicipios.cpacvemunicipio IN ('008','025','028','029','031','033','035','070','058','073','080','082','086','089','090','100','105','106','122')
        AND tbdeudor.deacvedeudor = ANY($1::text[]);
    `;

    const result = await pool.query(query, [claves]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en query:", err);
    res.status(500).json({ error: "Error en la base de datos" });
  }
});

app.delete("/borrar-ingresos", async (req, res) => {
  try {
    const query = `DELETE FROM tbingresos WHERE infingreso >= CURRENT_DATE`;
    const result = await pool.query(query);
    
    res.json({
      mensaje: "Registros eliminados exitosamente",
      registrosEliminados: result.rowCount,
      fechaActual: new Date().toISOString()
    });
  } catch (err) {
    console.error("Error al borrar ingresos:", err);
    res.status(500).json({ error: "Error al borrar los registros de ingresos" });
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("Servidor backend corriendo en http://192.168.28.35:3001");
});