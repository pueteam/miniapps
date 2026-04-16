# PWA Install UI

## Purpose

Definir el baseline de UI de instalación PWA que debe incluirse en miniapps con `pwa: true`.

## ADDED Requirements

### Requirement: Scaffolded PWA apps include install UI baseline
The scaffold MUST generate a baseline install UI module for miniapps with `pwa: true`, including state for install prompt availability, install trigger action, and a UI component that can render from AppShell.

#### Scenario: Generated PWA app includes install UI modules
- **WHEN** a developer runs the scaffold for a miniapp with default settings (PWA enabled)
- **THEN** the generated source includes install UI modules and wiring required to render an install action in the shell

### Requirement: Install UI is inert unless install prompt is available
The generated install UI component MUST render no interactive install control unless `beforeinstallprompt` has been received and app installation has not already completed.

#### Scenario: No install prompt means no install button
- **WHEN** the app has not received a `beforeinstallprompt` event
- **THEN** the generated install UI component does not render the install control

#### Scenario: Installed app hides install button
- **WHEN** the app receives an `appinstalled` event
- **THEN** the generated install UI component no longer renders the install control

### Requirement: Install UI renders only in AppShell context
The generated install UI component MUST only render in AppShell and MUST NOT be independently rendered by individual pages.

#### Scenario: AppShell controls install UI visibility
- **WHEN** a page attempts to render install UI directly
- **THEN** the install UI is only available through AppShell composition

### Requirement: Install prompt handling follows browser standard flow
The generated code MUST use the standard `beforeinstallprompt` event and `prompt()` method flow for PWA installation.

#### Scenario: Install event is captured and stored
- **WHEN** the `beforeinstallprompt` event fires
- **THEN** the event is stored and the install prompt availability state is updated

#### Scenario: User action triggers browser prompt
- **WHEN** the user clicks the install button
- **THEN** the stored event's `prompt()` method is called to show the browser install dialog