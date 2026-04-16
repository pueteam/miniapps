# Hook `useLocalStorage` y persistencia local

Estado: implementada

Resumen: Hook reutilizable para persistencia en `localStorage` y plantilla de uso en miniapps generadas.

Evidencia:
- [tooling/create-miniapp/src/cli.js](tooling/create-miniapp/src/cli.js) (escribe `src/hooks/useLocalStorage.ts` durante la generación)

Descripción: El CLI escribe una implementación tipada del hook en el esqueleto de la miniapp, definiendo la convención de persistencia local por defecto.

## Purpose

Definir el hook de persistencia local estándar para miniapps del monorepo.

## Requirements

### Requirement: Scaffold generates useLocalStorage hook
The scaffold MUST generate a `useLocalStorage` hook in new miniapps.

#### Scenario: Hook file is created
- **WHEN** a miniapp is scaffolded
- **THEN** `src/hooks/useLocalStorage.ts` is created with a working implementation

### Requirement: Hook provides type-safe localStorage access
The useLocalStorage hook MUST be fully typed and support generic type parameters.

#### Scenario: Typed key-value storage
- **WHEN** useLocalStorage is called with a key and default value
- **THEN** it returns the stored value or default, with correct TypeScript types

#### Scenario: Type inference works
- **WHEN** useLocalStorage is used with a string default
- **THEN** the hook infers string type for the value

### Requirement: Hook handles localStorage errors gracefully
The hook MUST handle localStorage unavailability or quota exceeded errors without crashing.

#### Scenario: Storage errors are caught
- **WHEN** localStorage throws an error (quota exceeded, disabled, etc.)
- **THEN** the hook returns the default value and does not throw

### Requirement: Hook supports setting new values
The hook MUST return a setter function to update stored values.

#### Scenario: Setter updates storage
- **WHEN** the setter is called with a new value
- **THEN** the value is persisted to localStorage and the component re-renders

### Requirement: Hook works with SSR frameworks
The hook MUST check for localStorage availability before use to support SSR/hydration scenarios.

#### Scenario: SSR safety
- **WHEN** the hook runs on the server
- **THEN** it does not attempt to access localStorage