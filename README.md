```markdown
# Proyecto Uno 🚀

Proyecto Uno is a React-based application designed to interact with a PostgreSQL database for retrieving debtor information based on specific criteria. It allows users to query debtor details, including their address, municipality, and state, by providing a list of debtor keys.

## Features ⚡

*   **Debtor Verification**: Retrieve debtor information by providing a list of debtor keys.
*   **Database Integration**: Connects to a PostgreSQL database to fetch data.
*   **Specific Filtering**: Filters results based on state ('15') and a predefined list of municipalities.
*   **React Frontend**: Built with React for a dynamic and responsive user interface.
*   **Express Backend**: Utilizes Express.js to handle API requests and database interactions.
*   **CORS Enabled**: Allows cross-origin requests for seamless frontend-backend communication.
*   **Linting**: Integrated ESLint for code quality and consistency.

## Tech Stack 📦

*   **Frontend**: React, React DOM, React Router DOM, Vite
*   **Backend**: Node.js, Express.js
*   **Database**: PostgreSQL (via `pg` package)
*   **HTTP Client**: Axios
*   **Middleware**: CORS, Morgan, Express-Rate-Limit
*   **File Handling**: Multer, JSZip, Node-Stream-Zip
*   **Caching**: Node-Cache
*   **Utilities**: Compression, XLSX
*   **Development Tools**: ESLint, Vite Plugin React

## Installation 🛠️

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd proyect-one
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Install Backend Dependencies**:
    Navigate to the server directory (if separate) or ensure the server dependencies are installed within the main project.
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Database Setup**:
    *   Ensure you have a PostgreSQL database running.
    *   Create the necessary tables and schemas as expected by the `server.js` script (e.g., `tbdirecciones`, `tbmunicipios`, `tbestados`, `tbdeudor`).
    *   Configure your database connection in the `db.js` file (or environment variables if preferred).

5.  **Environment Variables**:
    Create a `.env` file in the root directory and configure your database connection details.
    ```dotenv
    # Example .env file
    DB_USER=your_db_user
    DB_HOST=localhost
    DB_DATABASE=your_db_name
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    ```

## Usage ▶️

1.  **Start the Development Server**:
    This command will start both the React development server and the Express backend concurrently.
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  **Access the Application**:
    The application will typically be accessible at `http://localhost:5173` (Vite default) for the frontend, and the backend will be running on a separate port (e.g., `http://localhost:3000`).

3.  **Example API Request (from frontend)**:
    The frontend can make a `POST` request to the `/verificar` endpoint on the backend.

    ```javascript
    // Example in your React component
    import axios from 'axios';

    const verificarDeudores = async (claves) => {
      try {
        const response = await axios.post('http://localhost:3000/verificar', { claves });
        console.log('Debtor data:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error verifying debtors:', error);
        throw error;
      }
    };

    // Usage:
    // verificarDeudores(['key1', 'key2', 'key3']);
    ```

4.  **Example Backend Logic (`server.js`)**:
    The `server.js` file handles the POST request to `/verificar`.

    ```javascript
    // ... inside server.js
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
        console.error(err);
        res.status(500).json({ error: "Error interno del servidor" });
      }
    });
    // ...
    ```

## Project Structure 📂

```
.
├── public/             # Static assets (favicon, icons)
│   ├── favicon.svg
│   └── icons.svg
├── src/                # Frontend source code
│   ├── assets/         # Images and other assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/     # Reusable React components
│   │   ├── AdminPanel.jsx
│   │   ├── Carven2.jsx
│   │   ├── Leyendas.jsx
│   │   └── PlantillasWhatsapp.jsx
│   ├── App.css
│   ├── App.jsx         # Main application component
│   ├── db.js           # Database connection logic (backend)
│   ├── index.css
│   ├── main.jsx        # Entry point for React application
│   └── PROYECTOS_2.code-workspace # VS Code workspace file
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML entry point for Vite
├── package-lock.json   # npm dependency lock file
├── package.json        # Project metadata and dependencies
├── README.md           # This README file
├── server.js           # Express backend server
└── vite.config.js      # Vite build tool configuration
```

## Configuration ⚙️

*   **Database**: The `db.js` file or `.env` file should contain your PostgreSQL connection string or credentials.
*   **Port**: The Express server's port can be configured, typically via an environment variable (e.g., `PORT=3000`).
*   **CORS**: The `cors` middleware is used, allowing configuration of allowed origins if needed.
*   **Rate Limiting**: `express-rate-limit` is included and can be configured to limit API requests.

## Contributing 🤝

Contributions are welcome! Please follow these guidelines:

1.  **Fork the Repository**: Create your own fork of the project.
2.  **Create a New Branch**: Make your changes in a descriptive branch.
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Commit Your Changes**: Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new feature for X"
    ```
4.  **Push to the Branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
5.  **Open a Pull Request**: Submit a pull request to the main repository.

## License 📜

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
```