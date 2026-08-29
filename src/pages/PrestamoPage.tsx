import { useEffect, useState } from "react";

const PRESTAMO_RAW =
  "https://raw.githubusercontent.com/oscarsebastianbarriosfernandez-hue/prestamo/main/";

export default function PrestamoPage() {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${PRESTAMO_RAW}index.html`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then((source) => {
        if (!active) return;

        const withLocalDependencies = source
          .replace(/href=["']style\.css["']/g, `href="${PRESTAMO_RAW}style.css"`)
          .replace(/src=["']script\.js["']/g, `src="${PRESTAMO_RAW}script.js"`);

        setHtml(withLocalDependencies);
      })
      .catch((err) => {
        if (active) setError(`No se pudo cargar la página de prestamo: ${err.message}`);
      });

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>
        <h1>Error al cargar Préstamo</h1>
        <p>{error}</p>
        <p>Comprueba que tengas conexión a Internet y que el repositorio prestamo siga disponible.</p>
      </main>
    );
  }

  if (!html) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial, sans-serif" }}>
        Cargando Préstamo...
      </main>
    );
  }

  return (
    <iframe
      title="Banco Económico - Préstamo"
      srcDoc={html}
      style={{ width: "100%", height: "100vh", border: 0, display: "block" }}
      sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
    />
  );
}
