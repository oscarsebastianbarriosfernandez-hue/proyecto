import { FormEvent, useMemo, useState } from "react";
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
    return saved ? JSON.parse(saved) : [DEFAULT_USER];
  } catch {
    return [DEFAULT_USER];
  }
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
  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(36);
  const [rate, setRate] = useState(12);
  const [loanRequested, setLoanRequested] = useState(false);
  const [application, setApplication] = useState({ amount: "", purpose: "", income: "" });

  const monthlyPayment = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    if (!monthlyRate) return amount / months;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }, [amount, months, rate]);

  const openAuth = (tab: AuthTab) => {
    setAuthTab(tab);
    setMessage("");
    setView("auth");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (event: FormEvent) => {
    event.preventDefault();
    const found = users.find((item) => item.username.toLowerCase() === loginUser.trim().toLowerCase() && item.password === loginPassword);
    if (!found) {
      setMessage("Usuario o contraseña incorrectos.");
      return;
    }
    setUser(found);
    setSection("inicio");
    setMessage("");
    setView("app");
  };

  const createAccount = (event: FormEvent) => {
    event.preventDefault();
    const username = register.username.trim().toLowerCase();
    if (users.some((item) => item.username.toLowerCase() === username)) {
      setMessage("Ese usuario ya existe.");
      return;
    }
    const newUser = { ...register, username };
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
  };

  const requestLoan = (event: FormEvent) => {
    event.preventDefault();
    setLoanRequested(true);
    setSection("estado");
  };

  const goSection = (next: AppSection) => {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <header className="auth-header"><button className="brand-button" onClick={() => setView("landing")}><Logo /></button><div className="secure-header">🔒 <div><strong>Sitio seguro</strong><small>Tu información está protegida</small></div></div></header>
        <section className="auth-card">
          <div className="auth-left">
            <div className="auth-overlay" />
            <div className="auth-left-content"><span className="red-label">ACCESO SEGURO</span><h1>Bienvenido a tu <span>banca digital.</span></h1><div className="red-line" /><p>Ingresa para acceder al simulador de préstamos, realizar solicitudes y consultar el estado de tus operaciones.</p><div className="security-features"><Security icon="🛡" title="Conexión protegida" text="Tus datos viajan protegidos." /><Security icon="👤" title="Protección garantizada" text="Acceso personal y seguro." /><Security icon="24" title="Disponibilidad" text="Accede cuando lo necesites." /></div></div>
          </div>
          <div className="auth-right">
            <div className="auth-tabs"><button className={authTab === "login" ? "active" : ""} onClick={() => { setAuthTab("login"); setMessage(""); }}>Ingresar</button><button className={authTab === "register" ? "active" : ""} onClick={() => { setAuthTab("register"); setMessage(""); }}>Crear cuenta</button></div>
            {authTab === "login" ? (
              <form className="auth-panel" onSubmit={login}>
                <AuthTitle icon="👤" title="Iniciar sesión" text="Ingresa tus credenciales para continuar" />
                <Field label="Usuario"><div className="input-wrapper"><span>👤</span><input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} placeholder="Ingresa tu usuario" required /></div></Field>
                <Field label="Contraseña"><div className="input-wrapper"><span>🔒</span><input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Ingresa tu contraseña" required /><button type="button" className="eye-button" onClick={() => setShowLoginPassword((value) => !value)}>{showLoginPassword ? "🙈" : "👁"}</button></div></Field>
                <label className="remember-row"><input type="checkbox" /> Recordarme</label>
                <button className="auth-submit" type="submit">Ingresar <span>→</span></button>
                {message && <div className="message error">{message}</div>}
                <div className="or-line"><span>o</span></div>
                <button type="button" className="create-button" onClick={() => setAuthTab("register")}>👤+ Crear cuenta nueva</button>
                <div className="demo-info"><strong>Cuenta de demostración</strong><span>Usuario: <b>cliente</b></span><span>Contraseña: <b>12345</b></span></div>
              </form>
            ) : (
              <form className="auth-panel" onSubmit={createAccount}>
                <AuthTitle icon="👤+" title="Crear cuenta" text="Regístrate para acceder a tu banca digital" />
                <div className="two-fields"><Field label="Nombre"><div className="input-wrapper"><span>👤</span><input value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} placeholder="Tu nombre" required /></div></Field><Field label="Apellido"><div className="input-wrapper"><span>👤</span><input value={register.lastName} onChange={(e) => setRegister({ ...register, lastName: e.target.value })} placeholder="Tu apellido" required /></div></Field></div>
                <Field label="Usuario"><div className="input-wrapper"><span>@</span><input value={register.username} onChange={(e) => setRegister({ ...register, username: e.target.value })} placeholder="Crea un nombre de usuario" required /></div></Field>
                <Field label="Correo electrónico"><div className="input-wrapper"><span>✉</span><input type="email" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} placeholder="correo@ejemplo.com" required /></div></Field>
                <Field label="Contraseña"><div className="input-wrapper"><span>🔒</span><input type={showRegisterPassword ? "text" : "password"} minLength={5} value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} placeholder="Crea una contraseña" required /><button type="button" className="eye-button" onClick={() => setShowRegisterPassword((value) => !value)}>{showRegisterPassword ? "🙈" : "👁"}</button></div></Field>
                <label className="terms"><input type="checkbox" required /> <span>Acepto los términos y condiciones de uso de esta plataforma.</span></label>
                <button className="auth-submit" type="submit">Crear mi cuenta <span>→</span></button>
                {message && <div className="message">{message}</div>}
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
      <header className="app-header"><button className="brand-button" onClick={() => goSection("inicio")}><Logo /></button><nav>{(["inicio", "simulador", "prestamos", "requisitos", "solicitud", "estado"] as AppSection[]).map((item) => <button key={item} className={section === item ? "selected" : ""} onClick={() => goSection(item)}>{item === "inicio" ? "Inicio" : item === "simulador" ? "Simulador" : item === "prestamos" ? "Préstamos" : item === "requisitos" ? "Requisitos" : item === "solicitud" ? "Solicitud" : "Estado"}</button>)}</nav><div className="user-area"><span className="user-avatar">👤</span><span>{user?.name || "Cliente"}</span><button onClick={logout}>Salir</button></div></header>
      <section className="app-content">
        {section === "inicio" && <section className="dashboard-hero"><div><span className="red-label">BANCA DIGITAL</span><h1>Hola, {user?.name || "Cliente"}.<br /><span>¿Qué proyecto tienes en mente?</span></h1><p>Calcula tu préstamo, revisa las opciones disponibles y envía tu solicitud desde un solo lugar.</p><button className="primary-button" onClick={() => goSection("simulador")}>Simular mi préstamo →</button></div><CreditCard /></section>}
        {section === "simulador" && <section className="content-section"><SectionHeading eyebrow="SIMULADOR" title="Calcula tu cuota mensual" text="Modifica los valores y obtén una estimación de tu préstamo." /><div className="simulator-grid"><div className="form-card"><label>Monto solicitado <strong>Bs {amount.toLocaleString("es-BO")}</strong><input type="range" min="5000" max="300000" step="5000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></label><label>Plazo <strong>{months} meses</strong><input type="range" min="6" max="84" step="6" value={months} onChange={(e) => setMonths(Number(e.target.value))} /></label><label>Tasa anual <strong>{rate}%</strong><input type="range" min="5" max="25" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></label><button className="primary-button" onClick={() => goSection("solicitud")}>Solicitar este préstamo →</button></div><div className="result-card"><span>CUOTA ESTIMADA</span><strong>Bs {monthlyPayment.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><p>por {months} meses</p><div className="result-row"><span>Monto</span><b>Bs {amount.toLocaleString("es-BO")}</b></div><div className="result-row"><span>Tasa anual</span><b>{rate}%</b></div></div></div></section>}
        {section === "prestamos" && <section className="content-section"><SectionHeading eyebrow="PRÉSTAMOS" title="Opciones de financiamiento" text="Elige la alternativa que mejor se adapte a tu proyecto." /><div className="loan-cards"><LoanCard title="Préstamo Personal" text="Para proyectos personales, compras y gastos planificados." amount="Hasta Bs 300.000" onClick={() => { setAmount(50000); goSection("simulador"); }} /><LoanCard title="Préstamo para Vivienda" text="Una opción para financiar mejoras y proyectos de vivienda." amount="Hasta Bs 700.000" onClick={() => { setAmount(150000); goSection("simulador"); }} /><LoanCard title="Capital de Trabajo" text="Financiamiento pensado para impulsar pequeños negocios." amount="Hasta Bs 500.000" onClick={() => { setAmount(100000); goSection("simulador"); }} /></div></section>}
        {section === "requisitos" && <section className="content-section"><SectionHeading eyebrow="REQUISITOS" title="Lo que necesitas" text="Prepara estos datos antes de iniciar tu solicitud." /><div className="requirements"><Requirement n="01" title="Documento de identidad" text="Carnet de identidad vigente." /><Requirement n="02" title="Información personal" text="Datos de contacto y domicilio." /><Requirement n="03" title="Ingresos" text="Información que permita acreditar tus ingresos." /><Requirement n="04" title="Destino del préstamo" text="Indica para qué utilizarás el financiamiento." /></div></section>}
        {section === "solicitud" && <section className="content-section"><SectionHeading eyebrow="SOLICITUD" title="Solicita tu préstamo" text="Completa los datos básicos para registrar tu solicitud." /><form className="application-card" onSubmit={requestLoan}><div className="two-fields"><Field label="Monto"><input value={application.amount || String(amount)} onChange={(e) => setApplication({ ...application, amount: e.target.value })} type="number" min="5000" required /></Field><Field label="Ingreso mensual"><input value={application.income} onChange={(e) => setApplication({ ...application, income: e.target.value })} type="number" min="0" placeholder="Ej. 6000" required /></Field></div><Field label="Destino del préstamo"><select value={application.purpose} onChange={(e) => setApplication({ ...application, purpose: e.target.value })} required><option value="">Selecciona una opción</option><option>Vivienda</option><option>Educación</option><option>Negocio</option><option>Consumo personal</option><option>Otro</option></select></Field><button className="primary-button" type="submit">Enviar solicitud →</button></form></section>}
        {section === "estado" && <section className="content-section"><SectionHeading eyebrow="ESTADO" title="Estado de tu solicitud" text="Aquí puedes consultar el avance de tu operación." /><div className="status-card"><div className="status-icon">{loanRequested ? "✓" : "—"}</div><div><span className="status-label">{loanRequested ? "SOLICITUD REGISTRADA" : "SIN SOLICITUD ACTIVA"}</span><h2>{loanRequested ? "Tu solicitud está en revisión" : "Todavía no tienes una solicitud"}</h2><p>{loanRequested ? `Solicitud por Bs ${Number(application.amount || amount).toLocaleString("es-BO")}. Te mostraremos aquí las actualizaciones.` : "Puedes iniciar una solicitud desde el simulador."}</p>{!loanRequested && <button className="primary-button" onClick={() => goSection("simulador")}>Ir al simulador →</button>}</div></div></section>}
      </section>
      <footer className="app-footer">© 2026 Banco ECONOMICO S.A. — Proyecto académico</footer>
    </main>
  );
}

function Logo({ light = false }: { light?: boolean }) { return <div className={`logo ${light ? "logo-light" : ""}`}><div className="logo-symbol"><span /><span /><span /></div><div className="logo-text"><span>Banco</span><strong>ECONOMICO</strong></div></div>; }
function CreditCard() { return <div className="landing-card"><div className="card-top"><span>Banco ECONOMICO</span><span>VISA</span></div><div className="fake-chip" /><div className="fake-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 2026</div><div className="fake-bottom"><span>CLIENTE ECONOMICO</span><span>09/30</span></div></div>; }
function Security({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="security-feature"><div className="security-icon">{icon}</div><strong>{title}</strong><span>{text}</span></div>; }
function AuthTitle({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="auth-title"><div className="user-circle">{icon}</div><h2>{title}</h2><p>{text}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="field"><label>{label}</label>{children}</div>; }
function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="section-heading"><span className="red-label">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>; }
function LoanCard({ title, text, amount, onClick }: { title: string; text: string; amount: string; onClick: () => void }) { return <article className="loan-card"><div className="loan-icon">₿</div><h2>{title}</h2><p>{text}</p><strong>{amount}</strong><button onClick={onClick}>Conocer más →</button></article>; }
function Requirement({ n, title, text }: { n: string; title: string; text: string }) { return <article className="requirement"><span>{n}</span><div><h2>{title}</h2><p>{text}</p></div></article>; }
