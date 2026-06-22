import { loadTemplates } from './db';
import { getCurrentDate } from './utils';

export interface ExtractResult {
  variables: string[];
  fieldOptions: Record<string, string[]>;
  metadata: Record<string, string>;
}

function stripXMLTags(xmlContent: string): string {
  return xmlContent.replace(/<[^>]+>/g, '');
}

function decodeHTMLEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function getHeaderOrFooterContent(zip: PizZip, filePath: string): string {
  return zip.files[filePath] ? decodeHTMLEntities(stripXMLTags(zip.files[filePath].asText())) : '';
}

function extractVariablesFromText(
  text: string,
  variables: Set<string>,
  fieldOptions: Record<string, string[]>,
  metadata: Record<string, string>
): void {
  const regex = /\{([^:}]+):?([^}]*)\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const fieldName = match[1].trim();
    const additionalData = match[2].trim();

    if (/^[#/^>@&*%]/.test(fieldName)) continue;

    if (fieldName.startsWith('!metadata')) {
      metadata['description'] += additionalData.trim();
    } else if (additionalData.startsWith('opciones[')) {
      const options = additionalData
        .replace(/^opciones\[/, '')
        .replace(/\]$/, '')
        .split(/\|/)
        .map((o) => o.trim());
      variables.add(fieldName);
      fieldOptions[fieldName] = options;
    } else {
      variables.add(fieldName);
    }
  }
}

function extractVariablesFromSlides(
  zip: PizZip,
  variables: Set<string>,
  fieldOptions: Record<string, string[]>,
  metadata: Record<string, string>
): void {
  Object.keys(zip.files)
    .filter((f) => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'))
    .forEach((slideFile) => {
      const text = decodeHTMLEntities(stripXMLTags(zip.files[slideFile].asText()));
      extractVariablesFromText(text, variables, fieldOptions, metadata);
    });
}

export function extractVariables(templateName: string, doc: DocxtemplaterInstance): ExtractResult | null {
  try {
    const zip = doc.getZip();
    const variables = new Set<string>();
    const fieldOptions: Record<string, string[]> = {};
    const metadata: Record<string, string> = {
      description: `<b>Plantilla ${templateName}</b><br>`,
    };

    if (templateName.toLowerCase().endsWith('.docx')) {
      const text =
        getHeaderOrFooterContent(zip, 'word/header1.xml') +
        doc.getFullText() +
        getHeaderOrFooterContent(zip, 'word/footer1.xml');
      extractVariablesFromText(text, variables, fieldOptions, metadata);
    } else if (templateName.toLowerCase().endsWith('.pptx')) {
      extractVariablesFromSlides(zip, variables, fieldOptions, metadata);
    } else {
      throw new Error('Formato de archivo no compatible.');
    }

    return { variables: Array.from(variables), fieldOptions, metadata };
  } catch (error) {
    console.error('Error al extraer variables:', error);
    return null;
  }
}

export async function loadTemplateContent(templateName: string): Promise<ExtractResult | null> {
  try {
    const template = await loadTemplates(templateName);
    if (!template?.content) throw new Error(`Plantilla ${templateName} no encontrada.`);

    const zip = new PizZip(template.content);
    const doc = new docxtemplater(zip);
    const extracted = extractVariables(templateName, doc);
    if (!extracted) throw new Error('No se pudieron extraer las variables.');
    return extracted;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateDocument(
  templateName: string,
  data: Record<string, string>,
  fileNameOverride: string
): Promise<boolean> {
  try {
    const template = await loadTemplates(templateName);
    if (!template?.content) throw new Error('Template not found or invalid');

    const options: DocxtemplaterOptions = {
      paragraphLoop: true,
      linebreaks: true,
      parser(tag: string) {
        if (/^!metadata:.+$/.test(tag)) {
          return { get: () => '' };
        }
        const match = tag.match(/^(\w+):opciones\[((?:[^|]*\|?\s*)+)\]$/);
        if (match) {
          const label = match[1];
          return { get: (scope: Record<string, unknown>) => scope[label] };
        }
        return { get: (scope: Record<string, unknown>) => scope[tag] };
      },
    };

    const zip = new PizZip(template.content);
    const doc = new docxtemplater(zip, options);
    doc.setData(data);
    doc.render();

    const isPptx = templateName.toLowerCase().endsWith('.pptx');
    const mimeType = isPptx
      ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const output = doc.getZip().generate({ type: 'blob', mimeType });

    const base = templateName.replace(/\.(docx|pptx)$/i, '');
    const ext = isPptx ? 'pptx' : 'docx';
    const outputFileName = `${fileNameOverride || `${base}_${getCurrentDate()}`}.${ext}`;

    saveAs(output, outputFileName);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
