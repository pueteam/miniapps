import type { RefObject } from 'preact';

interface Props {
  variables: string[];
  fieldOptions: Record<string, string[]>;
  formRef: RefObject<HTMLFormElement>;
}

function parseVariableNameAndType(variable: string): { name: string; type: string } {
  const typePrefixes = ['email_', 'date_', 'number_', 'url_', 'tel_', 'time_', 'text_'];
  const matched = typePrefixes.find((p) => variable.startsWith(p));

  let type = 'text';
  let varName = variable;
  if (matched) {
    type = matched.slice(0, -1);
    varName = variable.slice(matched.length);
  }

  const name = varName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return { name, type };
}

export function TemplateForm({ variables, fieldOptions, formRef }: Readonly<Props>) {
  if (variables.length === 0) return null;

  return (
    <div class="tm-form-container">
      <form ref={formRef} id="templateForm">
        {variables.map((variable) => {
          const { name, type } = parseVariableNameAndType(variable);
          const listId = fieldOptions[variable] ? `${variable}-options` : undefined;

          return (
            <div key={variable} class="tm-form-group">
              <label for={variable}>{name}</label>
              <input
                type={type}
                id={variable}
                name={variable}
                list={listId}
                required={!fieldOptions[variable]}
              />
              {fieldOptions[variable] && (
                <datalist id={listId}>
                  {fieldOptions[variable].map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              )}
            </div>
          );
        })}
      </form>
    </div>
  );
}
