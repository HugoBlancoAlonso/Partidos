-- ==============================================================================
-- SCRIPT DE SEGURIDAD Y POLÍTICAS RLS (Row Level Security) PARA SUPABASE
-- Proyecto: Mundial 2026 Tracker (Partidos)
-- 
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/ayetfqivifhogdalzpej
-- 2. Entra en "SQL Editor" en el menú lateral izquierdo.
-- 3. Crea una "New query", pega todo el contenido de este archivo y pulsa "Run".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNCIÓN AUXILIAR: is_admin()
-- ------------------------------------------------------------------------------
-- Permite comprobar de forma segura y centralizada si el usuario actual es administrador (role = 1).
-- Usa SECURITY DEFINER para evitar bucles de recursión en RLS al consultar la tabla profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 1
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. TABLA: profiles
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas anteriores si existían
DROP POLICY IF EXISTS "Lectura pública de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Eliminar perfiles" ON public.profiles;

-- SELECT: Cualquier usuario (anónimo o autenticado) puede leer perfiles
-- (necesario para verificar disponibilidad de username en registro y ver perfiles públicos).
CREATE POLICY "Lectura pública de perfiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- INSERT: Un usuario solo puede crear su propio perfil con su auth.uid().
-- El rol debe ser 2 (usuario estándar) a menos que quien inserte ya sea admin.
CREATE POLICY "Usuarios pueden insertar su propio perfil"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  AND (role IS NULL OR role = 2 OR public.is_admin())
);

-- UPDATE: Un usuario puede actualizar su propio perfil, pero NO puede escalarse a admin (role = 1).
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    public.is_admin()
    OR role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- TRIGGER DE SEGURIDAD ADICIONAL: Blindaje contra escalada de privilegios en profiles
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Al insertar, forzar role = 2 si el usuario no es admin previo ni service_role
    IF (auth.jwt() ->> 'role') != 'service_role' AND NOT public.is_admin() THEN
      NEW.role := 2;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Al actualizar, impedir que un usuario cambie su propio rol
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF (auth.jwt() ->> 'role') != 'service_role' AND NOT public.is_admin() THEN
        NEW.role := OLD.role;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- 3. TABLA: competitions
-- ------------------------------------------------------------------------------
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de competiciones" ON public.competitions;
DROP POLICY IF EXISTS "Admin insertar competiciones" ON public.competitions;
DROP POLICY IF EXISTS "Admin actualizar competiciones" ON public.competitions;
DROP POLICY IF EXISTS "Admin eliminar competiciones" ON public.competitions;

-- SELECT: Todos pueden ver las competiciones
CREATE POLICY "Lectura de competiciones"
ON public.competitions
FOR SELECT
TO anon, authenticated
USING (true);

-- MUTACIONES: Solo administradores verificados en profiles (role = 1)
CREATE POLICY "Admin insertar competiciones"
ON public.competitions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin actualizar competiciones"
ON public.competitions
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin eliminar competiciones"
ON public.competitions
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. TABLA: matches
-- ------------------------------------------------------------------------------
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de partidos" ON public.matches;
DROP POLICY IF EXISTS "Admin insertar partidos" ON public.matches;
DROP POLICY IF EXISTS "Admin actualizar partidos" ON public.matches;
DROP POLICY IF EXISTS "Admin eliminar partidos" ON public.matches;

-- SELECT: Todos pueden consultar los partidos
CREATE POLICY "Lectura de partidos"
ON public.matches
FOR SELECT
TO anon, authenticated
USING (true);

-- MUTACIONES: Solo administradores (role = 1)
CREATE POLICY "Admin insertar partidos"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin actualizar partidos"
ON public.matches
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin eliminar partidos"
ON public.matches
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. TABLA: watched_matches
-- ------------------------------------------------------------------------------
ALTER TABLE public.watched_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen sus partidos vistos" ON public.watched_matches;
DROP POLICY IF EXISTS "Usuarios marcan sus partidos vistos" ON public.watched_matches;
DROP POLICY IF EXISTS "Usuarios actualizan sus partidos vistos" ON public.watched_matches;
DROP POLICY IF EXISTS "Usuarios desmarcan sus partidos vistos" ON public.watched_matches;

CREATE POLICY "Usuarios leen sus partidos vistos"
ON public.watched_matches
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios marcan sus partidos vistos"
ON public.watched_matches
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus partidos vistos"
ON public.watched_matches
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios desmarcan sus partidos vistos"
ON public.watched_matches
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. TABLA: user_competitions
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen sus competiciones seguidas" ON public.user_competitions;
DROP POLICY IF EXISTS "Usuarios siguen competiciones" ON public.user_competitions;
DROP POLICY IF EXISTS "Usuarios dejan de seguir competiciones" ON public.user_competitions;

CREATE POLICY "Usuarios leen sus competiciones seguidas"
ON public.user_competitions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios siguen competiciones"
ON public.user_competitions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios dejan de seguir competiciones"
ON public.user_competitions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. TRIGGER AUTOMÁTICO: Crear perfil al registrarse un usuario (auth.users)
-- ------------------------------------------------------------------------------
-- Garantiza que cada nuevo usuario tenga su fila en profiles con role = 2 (usuario estándar),
-- evitando race conditions o peticiones manuales vulnerables desde el cliente.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'usuario'
  );

  INSERT INTO public.profiles (id, username, role)
  VALUES (NEW.id, lower(base_username), 2)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
