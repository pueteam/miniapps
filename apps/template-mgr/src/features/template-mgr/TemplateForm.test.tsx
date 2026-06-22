import { cleanup, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { createRef } from 'preact';
import { TemplateForm } from './TemplateForm';

afterEach(cleanup);

describe('TemplateForm', () => {
  it('renders nothing when variables is empty', () => {
    const { container } = render(
      <TemplateForm variables={[]} fieldOptions={{}} formRef={createRef()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a text input for a plain variable', () => {
    render(
      <TemplateForm variables={['nombre_cliente']} fieldOptions={{}} formRef={createRef()} />
    );
    expect(screen.getByLabelText('Nombre Cliente')).toHaveProperty('type', 'text');
  });

  it('renders email input for email_ prefix', () => {
    render(
      <TemplateForm variables={['email_contacto']} fieldOptions={{}} formRef={createRef()} />
    );
    expect(screen.getByLabelText('Contacto')).toHaveProperty('type', 'email');
  });

  it('renders date input for date_ prefix', () => {
    render(
      <TemplateForm variables={['date_inicio']} fieldOptions={{}} formRef={createRef()} />
    );
    expect(screen.getByLabelText('Inicio')).toHaveProperty('type', 'date');
  });

  it('renders a datalist when fieldOptions are provided', () => {
    const fieldOptions = { estado: ['Activo', 'Inactivo'] };
    render(
      <TemplateForm variables={['estado']} fieldOptions={fieldOptions} formRef={createRef()} />
    );
    const input = screen.getByLabelText('Estado');
    expect(input.getAttribute('list')).toBe('estado-options');
    const options = [...document.querySelectorAll('#estado-options option')] as HTMLOptionElement[];
    const values = options.map((o) => o.value);
    expect(values).toContain('Activo');
    expect(values).toContain('Inactivo');
  });

  it('renders multiple variables', () => {
    render(
      <TemplateForm
        variables={['nombre', 'email_correo', 'date_fecha']}
        fieldOptions={{}}
        formRef={createRef()}
      />
    );
    expect(screen.getByLabelText('Nombre')).toBeDefined();
    expect(screen.getByLabelText('Correo')).toBeDefined();
    expect(screen.getByLabelText('Fecha')).toBeDefined();
  });
});
