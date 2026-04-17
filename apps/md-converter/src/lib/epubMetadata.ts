export type MetadataInput = {
  title: string;
  author: string;
  lang: string;
};

function normalizeScalar(value: string): string {
  return value.replace(/\r\n/g, '\n').trim();
}

function quote(value: string): string {
  return JSON.stringify(normalizeScalar(value));
}

export function buildMetadataYaml(input: MetadataInput): string {
  const lines: string[] = ['---'];

  if (input.title.trim()) lines.push(`title: ${quote(input.title)}`);
  if (input.author.trim()) lines.push(`author: ${quote(input.author)}`);
  if (input.lang.trim()) lines.push(`lang: ${quote(input.lang)}`);

  lines.push('...');
  lines.push('');

  return lines.join('\n');
}
