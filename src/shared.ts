import { upperFirst, lowerFirst } from 'lodash';

export function getName(words: string | string[]): string {
  if (typeof words === 'string') {
    return words;
  }

  const joined = words.map(upperFirst).join('');

  return lowerFirst(joined);
}

export function escapeQuotes(content: string): string {
  return content.replace(/"/g, '\\"').replace(/'/g, "\\'");
}
