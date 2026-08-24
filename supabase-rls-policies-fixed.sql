-- ========================================
-- POLÍTICAS RLS (Row Level Security) - CORREGIDAS
-- Diagnósticos Assistify
-- ========================================

-- 1. HABILITAR RLS EN LAS TABLAS
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;

-- 2. ELIMINAR POLÍTICAS EXISTENTES (si hay)
DROP POLICY IF EXISTS "Permitir INSERT público en diagnosticos" ON diagnosticos;
DROP POLICY IF EXISTS "Permitir SELECT público en diagnosticos" ON diagnosticos;
DROP POLICY IF EXISTS "Permitir INSERT público en respuestas" ON respuestas;
DROP POLICY IF EXISTS "Permitir SELECT público en respuestas" ON respuestas;
DROP POLICY IF EXISTS "Admin puede ver todos los diagnósticos" ON diagnosticos;
DROP POLICY IF EXISTS "Admin puede ver todas las respuestas" ON respuestas;

-- ========================================
-- POLÍTICAS PARA TABLA: diagnosticos
-- ========================================

-- Permitir INSERT a TODOS (anónimos y autenticados)
CREATE POLICY "Permitir INSERT público en diagnosticos"
ON diagnosticos
FOR INSERT
TO public  -- Cambio de 'anon' a 'public' para incluir ambos roles
WITH CHECK (true);

-- Permitir SELECT solo a usuarios autenticados con email autorizado
CREATE POLICY "Admin puede ver todos los diagnósticos"
ON diagnosticos
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'virtualassist@assistify365.com'
);

-- ========================================
-- POLÍTICAS PARA TABLA: respuestas
-- ========================================

-- Permitir INSERT a TODOS (anónimos y autenticados)
CREATE POLICY "Permitir INSERT público en respuestas"
ON respuestas
FOR INSERT
TO public  -- Cambio de 'anon' a 'public' para incluir ambos roles
WITH CHECK (true);

-- Permitir SELECT solo a usuarios autenticados con email autorizado
CREATE POLICY "Admin puede ver todas las respuestas"
ON respuestas
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'virtualassist@assistify365.com'
);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver políticas activas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('diagnosticos', 'respuestas')
ORDER BY tablename, policyname;

-- Verificar que RLS está habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('diagnosticos', 'respuestas');

-- ========================================
-- NOTAS DE SEGURIDAD
-- ========================================

-- ✅ RLS habilitado en ambas tablas
-- ✅ TODOS los usuarios (anónimos y autenticados) pueden INSERT
-- ✅ Usuarios anónimos NO pueden SELECT (leer datos de otros)
-- ✅ Solo el admin autenticado puede SELECT (ver dashboard)
-- ✅ Nadie puede UPDATE o DELETE (ni siquiera el admin)
--
-- CAMBIO IMPORTANTE: Se cambió 'TO anon' por 'TO public' en las políticas
-- de INSERT para permitir que tanto usuarios anónimos como autenticados
-- puedan guardar diagnósticos.
--
-- Para permitir UPDATE/DELETE al admin, agregar:
--
-- CREATE POLICY "Admin puede actualizar diagnósticos"
-- ON diagnosticos
-- FOR UPDATE
-- TO authenticated
-- USING (auth.jwt() ->> 'email' = 'virtualassist@assistify365.com')
-- WITH CHECK (auth.jwt() ->> 'email' = 'virtualassist@assistify365.com');
--
-- CREATE POLICY "Admin puede eliminar diagnósticos"
-- ON diagnosticos
-- FOR DELETE
-- TO authenticated
-- USING (auth.jwt() ->> 'email' = 'virtualassist@assistify365.com');
