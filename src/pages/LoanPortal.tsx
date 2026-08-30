import { FormEvent, useMemo, useState } from "react";
import "./LoanPortal.css";

type User = { name: string; lastName: string; username: string; email: string; password: string };
type View = "landing" | "auth" | "app";

const USERS_KEY = "bancoEconomicoUsers";
const SESSION_KEY = "bancoEconomicoSession";
const defaultUser: User = { name: "Cliente", lastName: "Demostración", username: "cliente", email: "cliente@demo.com", password: "12345" };

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw) as User[];
  } catch { /* recover with demo account */ }
  localStorage.setItem(USERS_KEY, JSON.stringify([defaultUser]));
  return [defaultUser];
}

function Logo() {
  return <div className="logo"><div className="logo-symbol"><span /><span /><span /></div><div className="logo-text"><span>Banco</span><strong>ECONOMICO</strong></div></div>;
}

function LoanPortal() {
  const storedSession = localStorage.getItem(SESSION_KEY);
  const initialUser = storedSession ? (JSON.parse(storedSession) as User) : null;
  const [view, setView] = useState<View>(initialUser ? "app" : "landing");
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(initialUser);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [register, setRegister] = useState({ name: "", lastName: "", username: "", email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loanAmount, setLoanAmount] = useState(30000);
  const [loanTerm, setLoanTerm] = useState(24);
  const [interestRate, setInterestRate] = useState(15);
  const [application, setApplication] = useState({ name: "", lastName: "", ci: "", phone: "", email: "" });
  const [files, setFiles] = useState({ identity: "Cédula de identidad", income: "Comprobante de ingresos" });
  const [applicationCode, setApplicationCode] = useState("");
  const [status, setStatus] = useState("");

  const loanResult = useMemo(() => {
    const monthlyRate = Math.pow(1 + interestRate / 100, 1 / 12) - 1;
    const payment = monthlyRate === 0 ? loanAmount / loanTerm : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
    return { payment, total: payment * loanTerm };
  }, [loanAmount, loanTerm, interestRate]);

  const openAuth = (tab: "login" | "register") => { setAuthTab(tab); setMessage(""); setView("auth"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const logout = () => { localStorage.removeItem(SESSION_KEY); setUser(null); setView("landing"); setLoginPassword(""); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    const found = getUsers().find((account) => account.username === loginUsername.trim().toLowerCase() && account.password === loginPassword);
    if (!found) { setMessage("Usuario o contraseña incorrectos."); return; }
    localStorage.setItem(SESSION_KEY, JSON.stringify(found)); setUser(found); setMessage(""); setView("app"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    const data: User = { ...register, username: register.username.trim().toLowerCase(), email: register.email.trim().toLowerCase() };
    const users = getUsers();
    if (users.some((account) => account.username === data.username)) { setMessage("Ese usuario ya existe. Elige otro."); return; }
    if (users.some((account) => account.email === data.email)) { setMessage("Ese correo ya está registrado."); return; }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, data]));
    setMessage("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
    setLoginUsername(data.username); setRegister({ name: "", lastName: "", username: "", email: "", password: "" });
    setTimeout(() => { setAuthTab("login"); setMessage(""); }, 1500);
  };

  const submitApplication = (event: FormEvent) => {
    event.preventDefault();
    const code = `BE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setApplicationCode(code); setStatus("");
  };

  const submitStatus = (event: FormEvent) => {
    event.preventDefault();
    setStatus(applicationCode.trim().toUpperCase());
  };

  if (view === "landing") return <Landing onLogin={() => openAuth("login")} onRegister={() => openAuth("register")} />;
  if (view === "auth") return <Auth tab={authTab} setTab={(tab) => { setAuthTab(tab); setMessage(""); }} onBack={() => setView("landing")} onLogin={handleLogin} onRegister={handleRegister} loginUsername={loginUsername} setLoginUsername={setLoginUsername} loginPassword={loginPassword} setLoginPassword={setLoginPassword} register={register} setRegister={setRegister} showLoginPassword={showLoginPassword} setShowLoginPassword={setShowLoginPassword} showRegisterPassword={showRegisterPassword} setShowRegisterPassword={setShowRegisterPassword} message={message} />;

  return <MainApp user={user!} logout={logout} loanAmount={loanAmount} setLoanAmount={setLoanAmount} loanTerm={loanTerm} setLoanTerm={setLoanTerm} interestRate={interestRate} setInterestRate={setInterestRate} loanResult={loanResult} application={application} setApplication={setApplication} files={files} setFiles={setFiles} applicationCode={applicationCode} setApplicationCode={setApplicationCode} status={status} submitApplication={submitApplication} submitStatus={submitStatus} />;
}

function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return <section className="landing-page"><div className="landing-background" /><header className="landing-header"><Logo /><div className="secure-top">🔒 Sitio seguro</div></header><main className="landing-content"><div className="landing-information"><span className="red-label">BANCA DIGITAL</span><h1>Tus proyectos <span>empiezan aquí.</span></h1><p>Simula tu crédito, conoce tus opciones de financiamiento y realiza tu solicitud de manera rápida y sencilla.</p><div className="landing-actions"><button className="primary-button" onClick={onLogin}>Ingresar a banca digital <span>→</span></button><button className="outline-button" onClick={onRegister}>Crear una cuenta</button></div></div><div className="landing-card"><div className="card-top"><span>Banco ECONOMICO</span><span>VISA</span></div><div className="fake-chip" /><div className="fake-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 2026</div><div className="fake-bottom"><span>CLIENTE ECONOMICO</span><span>09/30</span></div></div></main><div className="landing-features"><div><b>✓</b> Proceso digital</div><div><b>✓</b> Información clara</div><div><b>✓</b> Seguridad</div></div></section>;
}

function Auth(props: any) {
  const { tab, setTab, onBack, onLogin, onRegister, loginUsername, setLoginUsername, loginPassword, setLoginPassword, register, setRegister, showLoginPassword, setShowLoginPassword, showRegisterPassword, setShowRegisterPassword, message } = props;
  return <section className="auth-page"><div className="auth-background-shape shape-one" /><div className="auth-background-shape shape-two" /><header className="auth-header"><Logo /><div className="secure-header"><span className="lock-icon">🔒</span><div><strong>Sitio seguro</strong><small>Tu información está protegida</small></div></div></header><div className="auth-card"><div className="auth-left"><div className="auth-image-overlay" /><div className="auth-left-content"><span className="red-label">ACCESO SEGURO</span><h1>Bienvenido a tu <span>banca digital.</span></h1><div className="red-line" /><p>Ingresa para acceder al simulador de préstamos, realizar solicitudes y consultar el estado de tus operaciones.</p><div className="security-features"><Feature icon="🛡" title="Conexión protegida" text="Tus datos viajan protegidos." /><Feature icon="👤" title="Protección garantizada" text="Acceso personal y seguro." /><Feature icon="24" title="Disponibilidad" text="Accede cuando lo necesites." /></div></div></div><div className="auth-right"><div className="auth-tabs"><button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Ingresar</button><button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Crear cuenta</button></div>{tab === "login" ? <form onSubmit={onLogin}><AuthTitle icon="👤" title="Iniciar sesión" text="Ingresa tus credenciales para continuar" /><Field label="Usuario" icon="👤"><input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Ingresa tu usuario" required /></Field><Field label="Contraseña" icon="🔒" action={<button type="button" className="forgot" onClick={() => alert("Para recuperar tu contraseña debes contactar con atención al cliente.\n\nLínea gratuita: 800 10 10 10")}>¿Olvidaste tu contraseña?</button>}><div className="password-input"><input type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Ingresa tu contraseña" required /><button type="button" className="eye-button" onClick={() => setShowLoginPassword(!showLoginPassword)}>{showLoginPassword ? "🙈" : "👁"}</button></div></Field><div className="remember-row"><label><input type="checkbox" /> Recordarme</label></div><button className="auth-submit">Ingresar <span>→</span></button>{message && <div className="message error">{message}</div>}<div className="or-line"><span>o</span></div><button type="button" className="create-button" onClick={() => setTab("register")}>👤+ &nbsp; Crear cuenta nueva</button><div className="demo-info"><strong>Cuenta de demostración</strong><span>Usuario: <b>cliente</b></span><span>Contraseña: <b>12345</b></span></div></form> : <form onSubmit={onRegister}><AuthTitle icon="👤+" title="Crear cuenta" text="Regístrate para acceder a tu banca digital" /><div className="two-fields"><Field label="Nombre" icon="👤"><input value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} placeholder="Tu nombre" required /></Field><Field label="Apellido" icon="👤"><input value={register.lastName} onChange={(e) => setRegister({ ...register, lastName: e.target.value })} placeholder="Tu apellido" required /></Field></div><Field label="Usuario" icon="@"><input value={register.username} onChange={(e) => setRegister({ ...register, username: e.target.value })} placeholder="Crea un nombre de usuario" required /></Field><Field label="Correo electrónico" icon="✉"><input type="email" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} placeholder="correo@ejemplo.com" required /></Field><Field label="Contraseña" icon="🔒"><div className="password-input"><input type={showRegisterPassword ? "text" : "password"} value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} placeholder="Crea una contraseña" minLength={5} required /><button type="button" className="eye-button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>{showRegisterPassword ? "🙈" : "👁"}</button></div></Field><label className="terms"><input type="checkbox" required /> Acepto los términos y condiciones de uso de esta plataforma.</label><button className="auth-submit">Crear mi cuenta <span>→</span></button>{message && <div className={`message ${message.startsWith("Cuenta") ? "success" : "error"}`}>{message}</div>}</form>}</div><div className="auth-footer"><div>☎ <small>Línea gratuita</small><strong>800 10 10 10</strong></div><div>◉ <small>WhatsApp</small><strong>620 46 840</strong></div><div>◷ <small>Atención al cliente</small><strong>Lun - Vie 08:00 a 18:00</strong></div><div>📍 <small>Sucursales</small><strong>Encuentra la más cercana</strong></div></div></div><button className="back-home" onClick={onBack}>← Volver a la portada</button><div className="copyright">© 2026 Banco ECONOMICO S.A. — Proyecto académico</div></section>;
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="security-feature"><div className="security-icon">{icon}</div><div><strong>{title}</strong><span>{text}</span></div></div>; }
function AuthTitle({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="auth-title"><div className="user-circle">{icon}</div><h2>{title}</h2><p>{text}</p></div>; }
function Field({ label, icon, action, children }: { label: string; icon: string; action?: React.ReactNode; children: React.ReactNode }) { return <div className="field"><div className="label-row"><label>{label}</label>{action}</div><div className="input-wrapper"><span>{icon}</span>{children}</div></div>; }

function MainApp({ user, logout, loanAmount, setLoanAmount, loanTerm, setLoanTerm, interestRate, setInterestRate, loanResult, application, setApplication, files, setFiles, applicationCode, setApplicationCode, status, submitApplication, submitStatus }: any) {
  const money = (value: number) => new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return <main className="main-app"><header className="app-header"><Logo /><nav><a href="#inicio">Inicio</a><a href="#simulador">Simulador</a><a href="#prestamos">Préstamos</a><a href="#requisitos">Requisitos</a><a href="#solicitud">Solicitud</a><a href="#estado">Estado</a></nav><div className="user-area"><span className="user-avatar">👤</span><span>{user.username}</span><button onClick={logout}>Salir</button></div></header><section id="inicio" className="dashboard-hero"><div><span className="red-label">BANCA DIGITAL</span><h1>Hola, <span>{user.name}</span> 👋</h1><p>Administra tus solicitudes y encuentra la solución financiera que necesitas.</p><a href="#simulador" className="primary-button">Simular préstamo →</a></div><div className="dashboard-decoration"><div className="circle-decoration" /><div className="dashboard-card"><span>CRÉDITO DISPONIBLE</span><strong>Bs. 50.000</strong><small>Consulta referencial</small></div></div></section><section id="prestamos" className="section"><Heading label="NUESTROS PRODUCTOS" title="Encuentra el préstamo adecuado" text="Soluciones pensadas para acompañar tus proyectos." /><div className="loan-cards"><LoanCard icon="💼" type="PERSONAS" title="Crédito de consumo" text="Financiamiento para diferentes necesidades personales." /><LoanCard icon="🏢" type="NEGOCIOS" title="Crédito para negocio" text="Impulsa el crecimiento y desarrollo de tu emprendimiento." red /><LoanCard icon="🏠" type="VIVIENDA" title="Crédito de vivienda" text="Alternativas para ayudarte a cumplir tus proyectos de vivienda." /></div></section><section id="simulador" className="simulator-section"><Heading label="CALCULADORA" title="Simula tu crédito" text="Modifica el monto y plazo para obtener una cuota mensual aproximada." /><div className="simulator-box"><div className="simulator-inputs"><h3>Configura tu préstamo</h3><label>Monto solicitado</label><div className="money-input"><span>Bs.</span><input type="number" min={5000} max={1000000} step={500} value={loanAmount} onChange={(e) => setLoanAmount(Math.min(1000000, Math.max(5000, Number(e.target.value))))} /></div><input type="range" min={5000} max={1000000} step={500} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} /><div className="range-values"><span>Bs. 5.000</span><span>Bs. 1.000.000</span></div><label>Plazo</label><select value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))}>{[12,24,36,48,60].map((n) => <option key={n} value={n}>{n} meses</option>)}</select><label>Tasa anual referencial</label><select value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}>{[12,15,18,20].map((n) => <option key={n} value={n}>{n}%</option>)}</select></div><div className="simulator-result"><small>CUOTA MENSUAL ESTIMADA</small><h2>Bs. {money(loanResult.payment)}</h2><ResultRow label="Monto" value={`Bs. ${money(loanAmount)}`} /><ResultRow label="Plazo" value={`${loanTerm} meses`} /><ResultRow label="Tasa" value={`${interestRate}%`} /><ResultRow label="Total estimado" value={`Bs. ${money(loanResult.total)}`} /><a href="#solicitud" className="white-button">Solicitar crédito</a></div></div></section><section id="requisitos" className="section requirements-section"><Heading label="REQUISITOS" title="¿Qué necesitas?" /><div className="requirements-grid">{[["01","Documento de identidad","Identificación vigente."],["02","Comprobante de ingresos","Información que permita verificar tus ingresos."],["03","Información personal","Datos necesarios para la evaluación."],["04","Evaluación crediticia","Sujeto a evaluación y condiciones."]].map(([n,t,d]) => <div className="requirement" key={n}><b>{n}</b><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></section><section id="solicitud" className="section application-section"><Heading label="SOLICITUD DIGITAL" title="Solicita tu crédito" /><form className="application-form" onSubmit={submitApplication}><div className="form-grid">{[["name","Nombre","Tu nombre"],["lastName","Apellidos","Tus apellidos"],["ci","Cédula de identidad","12345678"],["phone","Teléfono","70000000"],["email","Correo electrónico","correo@ejemplo.com"]].map(([key,label,placeholder]) => <div className={key === "email" ? "full" : ""} key={key}><label>{label}</label><input type={key === "email" ? "email" : key === "phone" ? "tel" : "text"} placeholder={placeholder} value={application[key]} onChange={(e) => setApplication({ ...application, [key]: e.target.value })} required /></div>)}</div><h3>Documentos</h3><div className="upload-grid"><Upload icon="📄" title={files.identity} onChange={(name: string) => setFiles({ ...files, identity: name })} /><Upload icon="💰" title={files.income} onChange={(name: string) => setFiles({ ...files, income: name })} /></div><label className="terms"><input type="checkbox" required /> Acepto el tratamiento de mis datos para esta solicitud.</label><button className="primary-button" type="submit">Enviar solicitud →</button>{applicationCode && <div className="form-success"><strong>Solicitud registrada correctamente.</strong><br />Código: <strong>{applicationCode}</strong></div>}</form></section><section id="estado" className="status-section"><div><span className="red-label">SEGUIMIENTO</span><h2>Consulta tu solicitud</h2><p>Introduce el código de tu solicitud.</p></div><form onSubmit={submitStatus}><input value={applicationCode} onChange={(e) => setApplicationCode(e.target.value)} placeholder="BE-2026-12345" required /><button className="primary-button">Consultar</button></form>{status && <div className="status-result"><strong>Solicitud: {status}</strong><br /><br />Estado: <strong>En evaluación</strong></div>}</section><footer><Logo /><p>Proyecto académico de banca digital.</p><span>© 2026 Banco ECONOMICO — Proyecto académico</span></footer></main>;
}
function Heading({ label, title, text }: { label: string; title: string; text?: string }) { return <div className="section-heading"><span className="red-label">{label}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>; }
function LoanCard({ icon, type, title, text, red }: { icon: string; type: string; title: string; text: string; red?: boolean }) { return <article className={`loan-card ${red ? "red-card" : ""}`}><div className="loan-icon">{icon}</div><span>{type}</span><h3>{title}</h3><p>{text}</p><a href="#simulador">Simular →</a></article>; }
function ResultRow({ label, value }: { label: string; value: string }) { return <div className="result-row"><span>{label}</span><strong>{value}</strong></div>; }
function Upload({ icon, title, onChange }: { icon: string; title: string; onChange: (name: string) => void }) { return <label className="upload-box"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0].name)} /><span>{icon}</span><strong>{title}</strong><small>PDF, JPG o PNG</small></label>; }

export default LoanPortal;
