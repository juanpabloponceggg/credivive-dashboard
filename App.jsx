import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { COLORS, MESES, formatMoney, STATUS_CONFIG, PRODUCTOS, ESTATUS_LIST } from "./constants";

// ═══════════════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════════════
function LoadingScreen() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: COLORS.bg,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 60,
          height: 60,
          border: `4px solid ${COLORS.border}`,
          borderTop: `4px solid ${COLORS.primary}`,
          borderRadius: "50%",
          margin: "0 auto 20px",
          animation: "spin 1s linear infinite",
        }} />
        <h2 style={{ color: COLORS.text, marginBottom: 8 }}>Cargando...</h2>
        <p style={{ color: COLORS.textLight }}>Autenticando tu sesión</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN - REAL SUPABASE AUTH
// ═══════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, authError, onResetPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(authError || null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onLogin(email, password);
    if (result?.success) {
      setShowCheckmark(true);
      // Wait for checkmark animation before redirect
      setTimeout(() => {
        // useAuth will handle redirect via perfil state change
      }, 500);
    } else {
      setError(result?.error || "Error al iniciar sesión");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    const result = await onResetPassword(resetEmail);
    if (result?.success) {
      setResetSent(true);
      setResetLoading(false);
    } else {
      setError(result?.error || "Error al enviar reset");
      setResetLoading(false);
    }
  };

  if (showCheckmark) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: COLORS.bg,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: COLORS.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ color: COLORS.primary }}>Bienvenido!</h2>
        </div>
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  if (showReset) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: COLORS.bg,
        padding: 20,
      }}>
        <div style={{
          width: "100%",
          maxWidth: 400,
          background: COLORS.card,
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <h2 style={{ color: COLORS.text, marginBottom: 10, textAlign: "center" }}>
            Recuperar contraseña
          </h2>
          <p style={{ color: COLORS.textLight, marginBottom: 24, textAlign: "center", fontSize: 14 }}>
            Ingresa tu email para recibir un enlace de recuperación
          </p>

          {resetSent && (
            <div style={{
              background: COLORS.greenBg,
              color: COLORS.green,
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
            }}>
              Se envió un enlace de recuperación a tu email
            </div>
          )}

          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  background: COLORS.inputBg,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={resetLoading || resetSent}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: COLORS.primary,
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: resetLoading || resetSent ? "default" : "pointer",
                opacity: resetLoading || resetSent ? 0.6 : 1,
              }}
            >
              {resetLoading ? "Enviando..." : resetSent ? "Enlace enviado" : "Enviar enlace"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReset(false);
                setResetSent(false);
                setResetEmail("");
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "transparent",
                color: COLORS.primary,
                border: "none",
                marginTop: 12,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Volver al login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: COLORS.bg,
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: COLORS.card,
        borderRadius: 12,
        padding: 40,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: `3px solid ${COLORS.primary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ color: COLORS.text, margin: 0, fontSize: 28, fontWeight: 700 }}>
            Credivive
          </h1>
          <p style={{ color: COLORS.textLight, margin: "8px 0 0", fontSize: 13 }}>
            Dashboard de créditos
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: COLORS.redBg,
            color: COLORS.red,
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: COLORS.text, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Email
            </label>
            <div style={{ position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2"
                style={{ position: "absolute", left: 12, top: 11 }}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 44px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  background: COLORS.inputBg,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", color: COLORS.text, fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2"
                style={{ position: "absolute", left: 12, top: 11 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 44px",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                  background: COLORS.inputBg,
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Conectando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Forgot Password Link */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            type="button"
            onClick={() => setShowReset(true)}
            style={{
              background: "none",
              border: "none",
              color: COLORS.primary,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: 32,
          paddingTop: 20,
          borderTop: `1px solid ${COLORS.border}`,
          color: COLORS.textLight,
          fontSize: 12,
        }}>
          Solo personal autorizado de Credivive
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
function Sidebar({ activeScreen, onNavigate, onLogout, perfil }) {
  const isAdmin = perfil?.rol === "admin";
  const isEjecutivo = perfil?.rol === "ejecutivo";

  const adminMenuItems = [
    { key: "clientes", label: "Clientes", icon: "" },
    { key: "nomina", label: "Resumen Nómina", icon: "" },
    { key: "motos", label: "Resumen Motos", icon: "" },
    { key: "catalogo", label: "Catálogo", icon: "" },
    { key: "usuarios", label: "Usuarios", icon: "" },
    { key: "export", label: "Exportar Excel", icon: "" },
  ];

  const ejecutivoMenuItems = [
    { key: "pipeline", label: "Mi Pipeline", icon: "" },
  ];

  const menuItems = isAdmin ? adminMenuItems : ejecutivoMenuItems;

  return (
    <div style={{
      width: 240,
      height: "100vh",
      background: COLORS.dark,
      position: "fixed",
      left: 0,
      top: 0,
      display: "flex",
      flexDirection: "column",
      borderRight: `1px solid ${COLORS.darkMid}`,
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px",
        borderBottom: `1px solid ${COLORS.darkMid}`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${COLORS.primary}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}>
          ✓
        </div>
        <h2 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 700 }}>
          Credivive
        </h2>
      </div>

      {/* User Info */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${COLORS.darkMid}`,
      }}>
        <p style={{ margin: 0, color: "white", fontSize: 13, fontWeight: 600 }}>
          {perfil?.nombre_display || "Usuario"}
        </p>
        <div style={{
          background: COLORS.primary,
          color: "white",
          padding: "4px 8px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          display: "inline-block",
          marginTop: 8,
          textTransform: "uppercase",
        }}>
          {isAdmin ? "Administrador" : "Ejecutivo"}
        </div>
      </div>

      {/* Menu Items */}
      <nav style={{ flex: 1, padding: "12px 8px", overflow: "auto" }}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: activeScreen === item.key ? COLORS.primary : "transparent",
              color: activeScreen === item.key ? "white" : COLORS.textLight,
              border: "none",
              borderRadius: 8,
              textAlign: "left",
              fontSize: 14,
              fontWeight: activeScreen === item.key ? 600 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
              transition: "all 0.2s ease",
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div style={{
        padding: "12px 8px",
        borderTop: `1px solid ${COLORS.darkMid}`,
      }}>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: COLORS.red,
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "all 0.2s ease",
          }}
        >
          <span></span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN PLACEHOLDERS
// ═══════════════════════════════════════════════════════════════════════════

function ScreenPlaceholder({ title }) {
  return (
    <div style={{
      padding: 32,
      background: COLORS.bg,
      minHeight: "100vh",
    }}>
      <h1 style={{ color: COLORS.text, marginBottom: 8 }}>{title}</h1>
      <div style={{
        background: COLORS.card,
        padding: 32,
        borderRadius: 12,
        textAlign: "center",
        marginTop: 20,
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: COLORS.primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: 28,
        }}>

        </div>
        <h2 style={{ color: COLORS.text, marginBottom: 8 }}>Conectando datos reales...</h2>
        <p style={{ color: COLORS.textLight, margin: 0 }}>
          Esta pantalla será conectada a Supabase en la siguiente fase
        </p>
      </div>
    </div>
  );
}

function TablaClientes() {
  return (
    <div style={{
      padding: 32,
      background: COLORS.bg,
      minHeight: "100vh",
    }}>
      <h1 style={{ color: COLORS.text, marginBottom: 8 }}>Clientes</h1>
      <div style={{
        background: COLORS.card,
        padding: 32,
        borderRadius: 12,
        marginTop: 20,
      }}>
        <div style={{
          textAlign: "center",
          padding: "32px 0",
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: COLORS.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 28,
          }}>

          </div>
          <h2 style={{ color: COLORS.text, marginBottom: 8 }}>Tabla de Clientes</h2>
          <p style={{ color: COLORS.textLight }}>
            Conectando datos de Supabase...
          </p>
        </div>
      </div>
    </div>
  );
}

function ResumenNomina() {
  return <ScreenPlaceholder title="Resumen Nómina" />;
}

function ResumenMotos() {
  return <ScreenPlaceholder title="Resumen Motos" />;
}

function Catalogo() {
  return <ScreenPlaceholder title="Catálogo de Productos" />;
}

function GestionUsuarios() {
  return <ScreenPlaceholder title="Gestión de Usuarios" />;
}

function ExportarExcel() {
  return <ScreenPlaceholder title="Exportar a Excel" />;
}

function MiPipeline() {
  return <ScreenPlaceholder title="Mi Pipeline" />;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  const { user, perfil, loading, error: authError, isAdmin, login, logout, resetPassword } = useAuth();
  const [activeScreen, setActiveScreen] = useState("clientes");

  // Show loading screen while authenticating
  if (loading) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!user || !perfil) {
    return (
      <LoginScreen
        onLogin={login}
        authError={authError}
        onResetPassword={resetPassword}
      />
    );
  }

  // Main app layout
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      {/* Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onLogout={logout}
        perfil={perfil}
      />

      {/* Main Content */}
      <main style={{
        marginLeft: 240,
        flex: 1,
        overflowY: "auto",
      }}>
        {/* Admin Screens */}
        {isAdmin && activeScreen === "clientes" && <TablaClientes />}
        {isAdmin && activeScreen === "nomina" && <ResumenNomina />}
        {isAdmin && activeScreen === "motos" && <ResumenMotos />}
        {isAdmin && activeScreen === "catalogo" && <Catalogo />}
        {isAdmin && activeScreen === "usuarios" && <GestionUsuarios />}
        {isAdmin && activeScreen === "export" && <ExportarExcel />}

        {/* Ejecutivo Screens */}
        {!isAdmin && activeScreen === "pipeline" && <MiPipeline />}

        {/* Fallback */}
        {!isAdmin && activeScreen !== "pipeline" && (
          <div style={{ padding: 32 }}>
            <h2 style={{ color: COLORS.text }}>Pantalla no encontrada</h2>
          </div>
        )}
      </main>

      {/* Global Styles */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        html, body, #root {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
