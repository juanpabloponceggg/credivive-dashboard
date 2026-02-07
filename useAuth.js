import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPerfil = useCallback(async (userId) => {
    try {
      const { data, error: err } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (err) {
        console.error("Error perfil:", err.message);
        return { data: null, error: err.message };
      }

      if (!data) {
        return { data: null, error: "No se encontró tu perfil" };
      }

      if (!data.activo) {
        await supabase.auth.signOut();
        return { data: null, error: "Tu cuenta está desactivada" };
      }

      setPerfil(data);
      setError(null);
      return { data, error: null };
    } catch (e) {
      console.error("Exception perfil:", e);
      return { data: null, error: e.message };
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const result = await fetchPerfil(session.user.id);
        if (result.data) setPerfil(result.data);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setPerfil(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchPerfil]);

  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        const msg = err.message.includes("Invalid login")
          ? "Email o contraseña incorrectos"
          : err.message;
        setError(msg);
        return { success: false, error: msg };
      }

      // Small delay to ensure session is fully set
      await new Promise((r) => setTimeout(r, 300));

      const result = await fetchPerfil(data.user.id);

      if (result.error) {
        // Retry once after another delay
        await new Promise((r) => setTimeout(r, 500));
        const retry = await fetchPerfil(data.user.id);
        if (retry.error) {
          setError(retry.error);
          return { success: false, error: retry.error };
        }
        setPerfil(retry.data);
        return { success: true, perfil: retry.data };
      }

      setPerfil(result.data);
      return { success: true, perfil: result.data };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPerfil(null);
  };

  const resetPassword = async (email) => {
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    if (err) return { success: false, error: err.message };
    return { success: true };
  };

  const createUser = async ({ email, password, nombre, rol, ejecutivo_id }) => {
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre_display: nombre, rol } },
    });
    if (err) return { success: false, error: err.message };
    if (rol === "ejecutivo" && ejecutivo_id) {
      await supabase.from("perfiles").update({ ejecutivo_id, rol: "ejecutivo" }).eq("user_id", data.user.id);
    }
    if (rol === "admin") {
      await supabase.from("perfiles").update({ rol: "admin" }).eq("user_id", data.user.id);
    }
    return { success: true, user: data.user };
  };

  return {
    user, perfil, loading, error,
    isAdmin: perfil?.rol === "admin",
    isEjecutivo: perfil?.rol === "ejecutivo",
    ejecutivoId: perfil?.ejecutivo_id,
    nombreDisplay: perfil?.nombre_display || "",
    login, logout, resetPassword, createUser,
  };
}
