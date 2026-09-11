-- Migration: Migrate existing data from diagnosticos to respuestas_formularios
-- Date: 2026-09-11
-- Description: Migrates all existing diagnosticos data to the new JSONB architecture

-- This script transforms the old structure (diagnosticos + respuestas tables)
-- into the new JSONB structure (respuestas_formularios table)

DO $$
DECLARE
  diag_record RECORD;
  respuestas_array JSONB;
  new_id UUID;
BEGIN
  -- Loop through all diagnosticos
  FOR diag_record IN
    SELECT
      d.*,
      ARRAY_AGG(
        jsonb_build_object(
          'pregunta_index', r.pregunta_index,
          'bloque', r.bloque,
          'respuesta_index', r.respuesta_index,
          'respuesta_texto', r.respuesta_texto,
          'puntos', r.puntos
        ) ORDER BY r.pregunta_index
      ) as respuestas_data
    FROM diagnosticos d
    LEFT JOIN respuestas r ON r.diagnostico_id = d.id
    GROUP BY d.id
  LOOP
    -- Build the JSONB structure based on tipo
    IF diag_record.tipo = 'paso1' THEN
      respuestas_array := jsonb_build_object(
        'datos_usuario', jsonb_build_object(
          'antiguedad', diag_record.antiguedad,
          'profesion', COALESCE(diag_record.resultados->>'profesion', ''),
          'tipo', COALESCE(diag_record.resultados->>'tipoPractica', ''),
          'equipo', COALESCE(diag_record.resultados->>'tieneEquipo', '')
        ),
        'respuestas_preguntas', diag_record.respuestas_data,
        'puntajes', jsonb_build_object(
          'total', diag_record.puntaje_total,
          'nivel', diag_record.nivel
        ),
        'insight', COALESCE(diag_record.resultados->>'insight', ''),
        'migrated_from', 'diagnosticos_table',
        'original_id', diag_record.id
      );

    ELSIF diag_record.tipo = 'paso2' THEN
      respuestas_array := jsonb_build_object(
        'datos_usuario', jsonb_build_object(
          'antiguedad', diag_record.antiguedad,
          'profesion', COALESCE(diag_record.resultados->>'profesion', ''),
          'tipo', COALESCE(diag_record.resultados->>'tipoPractica', ''),
          'equipo', COALESCE(diag_record.resultados->>'tieneEquipo', '')
        ),
        'respuestas_preguntas', diag_record.respuestas_data,
        'puntajes', jsonb_build_object(
          'total', diag_record.puntaje_total,
          'nivel', diag_record.nivel
        ),
        'insight', COALESCE(diag_record.resultados->>'insight', ''),
        'migrated_from', 'diagnosticos_table',
        'original_id', diag_record.id
      );

    ELSIF diag_record.tipo = 'operaciones_saludables' THEN
      respuestas_array := jsonb_build_object(
        'datos_usuario', jsonb_build_object(
          'profesion', COALESCE(diag_record.resultados->>'profesion', ''),
          'tipo_practica', COALESCE(diag_record.resultados->>'tipoPractica', ''),
          'tiene_equipo', COALESCE(diag_record.resultados->>'tieneEquipo', ''),
          'antiguedad', diag_record.antiguedad
        ),
        'respuestas_preguntas', diag_record.respuestas_data,
        'puntajes', jsonb_build_object(
          'total', diag_record.puntaje_total,
          'nivel', diag_record.nivel
        ),
        'insight', COALESCE(diag_record.resultados->>'insight', ''),
        'migrated_from', 'diagnosticos_table',
        'original_id', diag_record.id
      );
    ELSE
      -- Unknown tipo, skip or use default structure
      CONTINUE;
    END IF;

    -- Map old tipo to new formulario_id
    -- paso1 -> diagnostico_paso1
    -- paso2 -> diagnostico_paso2
    -- operaciones_saludables -> operaciones_saludables

    -- Insert into new table
    INSERT INTO respuestas_formularios (
      formulario_id,
      email,
      nombre,
      respuestas,
      created_at
    ) VALUES (
      CASE
        WHEN diag_record.tipo = 'paso1' THEN 'diagnostico_paso1'
        WHEN diag_record.tipo = 'paso2' THEN 'diagnostico_paso2'
        ELSE diag_record.tipo
      END,
      diag_record.email,
      diag_record.nombre,
      respuestas_array,
      diag_record.created_at
    );

  END LOOP;

  RAISE NOTICE 'Migration completed successfully';
END $$;

-- Verify migration
SELECT
  formulario_id,
  COUNT(*) as total,
  MIN(created_at) as primera_respuesta,
  MAX(created_at) as ultima_respuesta
FROM respuestas_formularios
WHERE respuestas->>'migrated_from' = 'diagnosticos_table'
GROUP BY formulario_id
ORDER BY formulario_id;

-- Show total comparison
SELECT
  'diagnosticos (old)' as tabla,
  COUNT(*) as total
FROM diagnosticos
UNION ALL
SELECT
  'respuestas_formularios (migrated)' as tabla,
  COUNT(*) as total
FROM respuestas_formularios
WHERE respuestas->>'migrated_from' = 'diagnosticos_table';
