import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import "./PrestamoPage.css";

type View = "landing" | "auth" | "app";
type AuthTab = "login" | "register";
type AppSection = "inicio" | "simulador" | "prestamos" | "requisitos" | "solicitud" | "estado";

type User = {
  name: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

const DEFAULT_USER: User = {
  name: "Cliente",
  lastName: "Demostración",
  username: "cliente",
  email: "cliente@demo.com",
  password: "12345",
};

function getStoredUsers(): User[] {
  try {
    const saved = localStorage.getItem("bancoEconomicoUsers");
    if (saved) return JSON.parse(saved) as User[];
  } catch {
    // Si el almacenamiento está corrupto, se restaura la cuenta de demostración.
  }
  localStorage.setItem("bancoEconomicoUsers", JSON.stringify([DEFAULT_USER]));
  return [DEFAULT_USER];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PrestamoPage() {
  const [view, setView] = useState<View>("landing");
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [section, setSection] = useState<AppSection>("inicio");
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(getStoredUsers);
  const [loginUser, setLoginUser] = useState("cliente");
  const [loginPassword, setLoginPassword] = useState("12345");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [register, setRegister] = useState({ name: "", lastName: "", username: "", email: "", password: "" });
  const [amount, setAmount] = useState(30000);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(15);
  const [loanRequested, setLoanRequested] = useState(false);
  const [applicationCode, setApplicationCode] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [application, setApplication] = useState({
    firstName: "",
    lastName: "",
    ci: "",
    phone: "",
    email: "",
  });
  const [files, setFiles] = useState({ ci: "", income: "" });

  const monthlyPayment = useMemo(() => {
    const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;
    if (monthlyRate === 0) return amount / months;
    return amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }, [amount, months, rate]);

  const openAuth = (tab: AuthTab) => {
    setAuthTab(tab);
    setMessage("");
    setView("auth");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = users.find(
      (item) => item.username.toLowerCase() === loginUser.trim().toLowerCase() && item.password === loginPassword,
    );
    if (!found) {
      setMessage("Usuario o contraseña incorrectos.");
      return;
    }
    setUser(found);
    setSection("inicio");
    setMessage("");
    setView("app");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const username = register.username.trim().toLowerCase();
    const email = register.email.trim().toLowerCase();
    if (users.some((item) => item.username.toLowerCase() === username)) {
      setMessage("Ese usuario ya existe. Elige otro.");
      return;
    }
    if (users.some((item) => item.email.toLowerCase() === email)) {
      setMessage("Ese correo ya está registrado.");
      return;
    }
    const newUser = { ...register, username, email };
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    localStorage.setItem("bancoEconomicoUsers", JSON.stringify(nextUsers));
    setLoginUser(username);
    setLoginPassword(register.password);
    setRegister({ name: "", lastName: "", username: "", email: "", password: "" });
    setMessage("Cuenta creada correctamente. Ahora puedes ingresar.");
    setAuthTab("login");
  };

  const logout = () => {
    setUser(null);
    setView("landing");
    setSection("inicio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestLoan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = `BE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setApplicationCode(code);
    setStatusCode("");
    setStatusMessage("Solicitud registrada correctamente.");
    setLoanRequested(true);
    setSection("estado");
  };

  const checkStatus = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = statusCode.trim().toUpperCase();
    if (!code) return;
    setStatusMessage(`Solicitud: ${code}`);
  };

  const goSection = (next: AppSection) => {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateApplication = (key: keyof typeof application, value: string) => {
    setApplication((current) => ({ ...current, [key]: value }));
  };

  const updateFile = (key: "ci" | "income", file?: File) => {
    if (file) setFiles((current) => ({ ...current, [key]: file.name }));
  };

  if (view === "landing") {
    return (
      <main className="prestamo-page landing-page">
        <div className="landing-background" />
        <header className="landing-header">
          <Logo light />
          <span className="secure-pill">🔒 Sitio seguro</span>
        </header>
        <section className="landing-content">
          <div className="landing-information">
            <span className="red-label">BANCA DIGITAL</span>
            <h1>Tus proyectos <span>empiezan aquí.</span></h1>
            <p>Simula tu crédito, conoce tus opciones de financiamiento y realiza tu solicitud de manera rápida y sencilla.</p>
            <div className="landing-actions">
              <button className="primary-button" onClick={() => openAuth("login")}>Ingresar a banca digital <span>→</span></button>
              <button className="outline-button" onClick={() => openAuth("register")}>Crear una cuenta</button>
            </div>
          </div>
          <CreditCard />
        </section>
        <div className="landing-features"><span>✓ Proceso digital</span><span>✓ Información clara</span><span>✓ Seguridad</span></div>
      </main>
    );
  }

  if (view === "auth") {
    return (
      <main className="prestamo-page auth-page">
        <header className="auth-header">
          <button className="brand-button" onClick={() => setView("landing")}><Logo /></button>
          <div className="secure-header">🔒 <div><strong>Sitio seguro</strong><small>Tu información está protegida</small></div></div>
        </header>
        <section className="auth-card">
          <div className="auth-left">
            <div className="auth-overlay" />
            <div className="auth-left-content">
              <span className="red-label">ACCESO SEGURO</span>
              <h1>Bienvenido a tu <span>banca digital.</span></h1>
              <div className="red-line" />
              <p>Ingresa para acceder al simulador de préstamos, realizar solicitudes y consultar el estado de tus operaciones.</p>
              <div className="security-features">
                <Security icon="🛡" title="Conexión protegida" text="Tus datos viajan protegidos." />
                <Security icon="👤" title="Protección garantizada" text="Acceso personal y seguro." />
                <Security icon="24" title="Disponibilidad" text="Accede cuando lo necesites." />
              </div>
            </div>
          </div>
          <div className="auth-right">
            <div className="auth-tabs">
              <button className={authTab === "login" ? "active" : ""} onClick={() => { setAuthTab("login"); setMessage(""); }}>Ingresar</button>
              <button className={authTab === "register" ? "active" : ""} onClick={() => { setAuthTab("register"); setMessage(""); }}>Crear cuenta</button>
            </div>
            {authTab === "login" ? (
              <form className="auth-panel" onSubmit={login}>
                <AuthTitle icon="👤" title="Iniciar sesión" text="Ingresa tus credenciales para continuar" />
                <Field label="Usuario"><div className="input-wrapper"><span>👤</span><input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} placeholder="Ingresa tu usuario" autoComplete="username" required /></div></Field>
                <Field label="Contraseña"><div className="input-wrapper"><span>🔒</span><input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Ingresa tu contraseña" autoComplete="current-password" required /><button type="button" className="eye-button" onClick={() => setShowLoginPassword((value) => !value)}>{showLoginPassword ? "🙈" : "👁"}</button></div></Field>
                <label className="remember-row"><input type="checkbox" /> <span>Recordarme</span></label>
                <button className="auth-submit" type="submit">Ingresar <span>→</span></button>
                <button type="button" className="forgot" onClick={() => window.alert("Para recuperar tu contraseña debes contactar con atención al cliente.\n\nLínea gratuita: 800 10 10 10")}>¿Olvidaste tu contraseña?</button>
                {message && <div className={`message ${message.includes("correctamente") ? "" : "error"}`}>{message}</div>}
                <div className="or-line"><span>o</span></div>
                <button type="button" className="create-button" onClick={() => setAuthTab("register")}>👤+ Crear cuenta nueva</button>
                <div className="demo-info"><strong>Cuenta de demostración</strong><span>Usuario: <b>cliente</b></span><span>Contraseña: <b>12345</b></span></div>
              </form>
            ) : (
              <form className="auth-panel" onSubmit={createAccount}>
                <AuthTitle icon="👤+" title="Crear cuenta" text="Regístrate para acceder a tu banca digital" />
                <div className="two-fields">
                  <Field label="Nombre"><div className="input-wrapper"><span>👤</span><input value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} placeholder="Tu nombre" required /></div></Field>
                  <Field label="Apellido"><div className="input-wrapper"><span>👤</span><input value={register.lastName} onChange={(e) => setRegister({ ...register, lastName: e.target.value })} placeholder="Tu apellido" required /></div></Field>
                </div>
                <Field label="Usuario"><div className="input-wrapper"><span>@</span><input value={register.username} onChange={(e) => setRegister({ ...register, username: e.target.value })} placeholder="Crea un nombre de usuario" required /></div></Field>
                <Field label="Correo electrónico"><div className="input-wrapper"><span>✉</span><input type="email" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} placeholder="correo@ejemplo.com" required /></div></Field>
                <Field label="Contraseña"><div className="input-wrapper"><span>🔒</span><input type={showRegisterPassword ? "text" : "password"} minLength={5} value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} placeholder="Crea una contraseña" required /><button type="button" className="eye-button" onClick={() => setShowRegisterPassword((value) => !value)}>{showRegisterPassword ? "🙈" : "👁"}</button></div></Field>
                <label className="terms"><input type="checkbox" required /> <span>Acepto los términos y condiciones de uso de esta plataforma.</span></label>
                <button className="auth-submit" type="submit">Crear mi cuenta <span>→</span></button>
                {message && <div className={`message ${message.includes("correctamente") ? "" : "error"}`}>{message}</div>}
              </form>
            )}
          </div>
          <div className="auth-footer"><span>☎ <b>800 10 10 10</b></span><span>◉ <b>620 46 840</b></span><span>◷ <b>Lun - Vie 08:00 a 18:00</b></span><span>📍 <b>Encuentra la más cercana</b></span></div>
        </section>
        <button className="back-home" onClick={() => setView("landing")}>← Volver a la portada</button>
      </main>
    );
  }

  return (
    <main className="prestamo-page main-app">
      <header className="app-header">
        <button className="brand-button" onClick={() => goSection("inicio")}><Logo /></button>
        <nav>
          {(["inicio", "simulador", "prestamos", "requisitos", "solicitud", "estado"] as AppSection[]).map((item) => (
            <button key={item} className={section === item ? "selected" : ""} onClick={() => goSection(item)}>
              {item === "inicio" ? "Inicio" : item === "simulador" ? "Simulador" : item === "prestamos" ? "Préstamos" : item === "requisitos" ? "Requisitos" : item === "solicitud" ? "Solicitud" : "Estado"}
            </button>
          ))}
        </nav>
        <div className="user-area"><span className="user-avatar">👤</span><span>{user?.username || "Cliente"}</span><button onClick={logout}>Salir</button></div>
      </header>

      <section className="app-content">
        {section === "inicio" && <section className="dashboard-hero"><div><span className="red-label">BANCA DIGITAL</span><h1>Hola, {user?.name || "Cliente"}.<br /><span>¿Qué proyecto tienes en mente?</span></h1><p>Calcula tu préstamo, revisa las opciones disponibles y envía tu solicitud desde un solo lugar.</p><button className="primary-button" onClick={() => goSection("simulador")}>Simular mi préstamo →</button></div><CreditCard /></section>}

        {section === "simulador" && <section className="content-section"><SectionHeading eyebrow="SIMULADOR" title="Calcula tu cuota mensual" text="Modifica los valores y obtén una estimación de tu préstamo." /><div className="simulator-grid"><div className="form-card"><label>Monto solicitado <strong>Bs. {formatMoney(amount)}</strong><input type="range" min="5000" max="1000000" step="500" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label><label>Plazo <strong>{months} meses</strong><select value={months} onChange={(e) => setMonths(Number(e.target.value))}><option value={12}>12 meses</option><option value={24}>24 meses</option><option value={36}>36 meses</option><option value={48}>48 meses</option><option value={60}>60 meses</option></select></label><label>Tasa anual referencial <strong>{rate}%</strong><select value={rate} onChange={(e) => setRate(Number(e.target.value))}><option value={12}>12%</option><option value={15}>15%</option><option value={18}>18%</option><option value={20}>20%</option></select></label><button className="primary-button" onClick={() => goSection("solicitud")}>Solicitar este préstamo →</button></div><div className="result-card"><span>CUOTA MENSUAL ESTIMADA</span><strong>Bs. {formatMoney(monthlyPayment)}</strong><p>por {months} meses</p><div className="result-row"><span>Monto</span><b>Bs. {formatMoney(amount)}</b></div><div className="result-row"><span>Plazo</span><b>{months} meses</b></div><div className="result-row"><span>Tasa</span><b>{rate}%</b></div><div className="result-row"><span>Total estimado</span><b>Bs. {formatMoney(monthlyPayment * months)}</b></div></div></div></section>}

        {section === "prestamos" && <section className="content-section"><SectionHeading eyebrow="PRÉSTAMOS" title="Opciones de financiamiento" text="Elige la alternativa que mejor se adapte a tu proyecto." /><div className="loan-cards"><LoanCard title="Crédito de consumo" text="Financiamiento para diferentes necesidades personales." amount="Hasta Bs. 300.000" onClick={() => { setAmount(50000); goSection("simulador"); }} /><LoanCard title="Crédito de vivienda" text="Alternativas para ayudarte a cumplir tus proyectos de vivienda." amount="Hasta Bs. 700.000" onClick={() => { setAmount(150000); goSection("simulador"); }} /><LoanCard title="Crédito para negocio" text="Impulsa el crecimiento y desarrollo de tu emprendimiento." amount="Hasta Bs. 500.000" onClick={() => { setAmount(100000); goSection("simulador"); }} /></div></section>}

        {section === "requisitos" && <section className="content-section"><SectionHeading eyebrow="REQUISITOS" title="¿Qué necesitas?" text="Prepara estos datos antes de iniciar tu solicitud." /><div className="requirements"><Requirement n="01" title="Documento de identidad" text="Identificación vigente." /><Requirement n="02" title="Comprobante de ingresos" text="Información que permita verificar tus ingresos." /><Requirement n="03" title="Información personal" text="Datos necesarios para la evaluación." /><Requirement n="04" title="Evaluación crediticia" text="Sujeto a evaluación y condiciones." /></div></section>}

        {section === "solicitud" && <section className="content-section"><SectionHeading eyebrow="SOLICITUD DIGITAL" title="Solicita tu crédito" text="Completa tus datos y adjunta la documentación requerida." /><form className="application-card" onSubmit={requestLoan}><div className="two-fields"><Field label="Nombre"><input value={application.firstName || user?.name || ""} onChange={(e) => updateApplication("firstName", e.target.value)} placeholder="Tu nombre" required /></Field><Field label="Apellidos"><input value={application.lastName || user?.lastName || ""} onChange={(e) => updateApplication("lastName", e.target.value)} placeholder="Tus apellidos" required /></Field></div><div className="two-fields"><Field label="Cédula de identidad"><input value={application.ci} onChange={(e) => updateApplication("ci", e.target.value)} placeholder="12345678" required /></Field><Field label="Teléfono"><input value={application.phone} onChange={(e) => updateApplication("phone", e.target.value)} placeholder="70000000" type="tel" required /></Field></div><Field label="Correo electrónico"><input value={application.email || user?.email || ""} onChange={(e) => updateApplication("email", e.target.value)} placeholder="correo@ejemplo.com" type="email" required /></Field><h3>Documentos</h3><div className="upload-grid"><label className="upload-box"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => updateFile("ci", e.target.files?.[0])} /><span>📄</span><strong>{files.ci || "Cédula de identidad"}</strong><small>PDF, JPG o PNG</small></label><label className="upload-box"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => updateFile("income", e.target.files?.[0])} /><span>💰</span><strong>{files.income || "Comprobante de ingresos"}</strong><small>PDF, JPG o PNG</small></label></div><label className="terms"><input type="checkbox" required /><span>Acepto el tratamiento de mis datos para esta solicitud.</span></label><button className="primary-button" type="submit">Enviar solicitud →</button></form></section>}

        {section === "estado" && <section className="content-section"><SectionHeading eyebrow="SEGUIMIENTO" title="Consulta tu solicitud" text="Introduce el código de tu solicitud para consultar su estado." /><div className="status-card"><div className="status-icon">✓</div><div><span className="status-label">SEGUIMIENTO</span><h2>{loanRequested ? "Solicitud registrada" : "Consulta de solicitud"}</h2><p>{loanRequested ? `Tu solicitud por Bs. ${formatMoney(Number(applicationCode ? amount : amount))} fue registrada correctamente.` : "Introduce el código que recibiste al enviar tu solicitud."}</p><form className="status-form" onSubmit={checkStatus}><input value={statusCode} onChange={(e) => setStatusCode(e.target.value)} placeholder={applicationCode || "BE-2026-12345"} required /><button className="primary-button" type="submit">Consultar</button></form>{applicationCode && <button className="code-button" type="button" onClick={() => setStatusCode(applicationCode)}>Usar mi código: {applicationCode}</button>}{statusMessage && <div className="message">{statusMessage}<br /><br /><strong>Estado: En evaluación</strong></div>}</div></div></section>}
      </section>
      <footer className="app-footer">© 2026 Banco ECONOMICO S.A. — Proyecto académico</footer>
    </main>
  );
}

function Logo({ light = false }: { light?: boolean }) { return <div className={`logo ${light ? "logo-light" : ""}`}><div className="logo-symbol"><span /><span /><span /></div><div className="logo-text"><span>Banco</span><strong>ECONOMICO</strong></div></div>; }
function CreditCard() { return <div className="landing-card"><div className="card-top"><span>Banco ECONOMICO</span><span>VISA</span></div><div className="fake-chip" /><div className="fake-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 2026</div><div className="fake-bottom"><span>CLIENTE ECONOMICO</span><span>09/30</span></div></div>; }
function Security({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="security-feature"><div className="security-icon">{icon}</div><strong>{title}</strong><span>{text}</span></div>; }
function AuthTitle({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="auth-title"><div className="user-circle">{icon}</div><h2>{title}</h2><p>{text}</p></div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="field"><label>{label}</label>{children}</div>; }
function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="section-heading"><span className="red-label">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>; }
function LoanCard({ title, text, amount, onClick }: { title: string; text: string; amount: string; onClick: () => void }) { return <article className="loan-card"><div className="loan-icon">💼</div><h2>{title}</h2><p>{text}</p><strong>{amount}</strong><button onClick={onClick}>Simular →</button></article>; }
function Requirement({ n, title, text }: { n: string; title: string; text: string }) { return <article className="requirement"><span>{n}</span><div><h2>{title}</h2><p>{text}</p></div></article>; }
