import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

export function useAuth() {
  const [user, setUser] = useState(null);       // Supabase Auth user
  const [perfil, setPerfil] = useState(null);    // { rol, ejecutivo_id, nombre_display, activo }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Cargar perfil del usuario ───
  const fetchPerfil = useCallback(async (userId) => {
    const { data, error: err } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (err) {
      console.error("Error al cargar perfil:", err.message);
      setError("No se encontró tu perfil. Contacta al administrador.");
      setPerfil(null);
      return null;
    }

    if (!data.activo) {
      setError("Tu cuenta está desactivada. Contacta al administrador.");
      await supabase.auth.signOut();
      setPerfil(null);
      return null;
    }

    setPerfil(data);
    setError(null);
    return data;
  }, []);

  // ─── Escuchar cambios de sesión ───
  useEffect(() => {
    // Checar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchPerfil(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listener de cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await fetchPerfil(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setPerfil(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchPerfil]);

  // ─── Login ───
  const login = async (email, password) => {
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      if (err.message.includes("Invalid login")) {
        setError("Email o contraseña incorrectos");
      } else {
        setError(err.message);
      }
      return { success: false, error: err.message };
    }

    const p = await fetchPerfil(data.user.id);
    return { success: !!p, perfil: p };
  };

  // ─── Logout ───
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  };

  // ─── Reset password ───
  const resetPassword = async (email) => {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    if (err) return { success: false, error: err.message };
    return { success: true };
  };

  // ─── Create user (admin only) ───
  const createUser = async ({ email, password, nombre, rol, ejecutivo_id }) => {
    // Usa la función admin de Supabase para crear usuarios
    // Nota: en producción se usa una Edge Function o supabase.auth.admin
    // Por ahora usamos signUp + metadatos
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_display: nombre,
          rol: rol,
        },
      },
    });

    if (err) return { success: false, error: err.message };

    // Actualizar el perfil con el ejecutivo_id si es ejecutivo
    if (rol === "ejecutivo" && ejecutivo_id) {
      await supabase
        .from("perfiles")
        .update({ ejecutivo_id, rol: "ejecutivo" })
        .eq("user_id", data.user.id);
    }

    // Si es admin, asegurar rol admin
    if (rol === "admin") {
      await supabase
        .from("perfiles")
        .update({ rol: "admin" })
        .eq("user_id", data.user.id);
    }

    return { success: true, user: data.user };
  };

  return {
    user,
    perfil,
    loading,
    error,
    isAdmin: perfil?.rol === "admin",
    isEjecutivo: perfil?.rol === "ejecutivo",
    ejecutivoId: perfil?.ejecutivo_id,
    nombreDisplay: perfil?.nombre_display || "",
    login,
    logout,
    resetPassword,
    createUser,
  };
}
