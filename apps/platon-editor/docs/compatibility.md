# Compatibilidad del motor

React Flow 12.11.6 con Preact 10, Vite preset Preact y aliases TypeScript de react/react-dom a preact/compat.

Verificado el 2026-09-07: build de producción correcto y prueba Chromium `compat.spec.ts` correcta: mover grupo anidado desplaza al hijo; arrastrar entre puertos crea un enlace. Sin errores de página. La prueba se integra posteriormente en la UI final.

El 2026-09-08 se sustituyó la sonda por el editor real. Verificación final: 42 pruebas unitarias y 7 E2E Chromium correctas; TypeScript, validación estructural y compilación global Pages correctas. Los E2E finales se ejecutaron bajo `/miniapps/platon-editor/` y verifican también recarga offline. Se revisaron el PNG exportado (`ejemplo.png`) y las capturas de escritorio y móvil.

Vitest se ejecutó con `--pool=vmThreads --maxWorkers=1 --no-file-parallelism`. Para probar la compilación de Pages existente: definir `PLATON_E2E_PREBUILT=1` y `PLATON_E2E_REPO=miniapps`, y ejecutar `pnpm --filter @miniapps/platon-editor e2e` desde la raíz.
