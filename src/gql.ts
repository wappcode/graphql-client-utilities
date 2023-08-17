import { GQLTagData } from './types';

const extractOperationName = (query: string): string => {
  let queryBase = query.replace('query', '');
  queryBase = queryBase.replace('mutation', '');
  queryBase = queryBase.trim();
  const regexp = new RegExp(/^(\w+)[\s\(\{}]/);
  const matches = regexp.exec(queryBase) ?? [];
  const operationName = matches[1] ?? '';
  return operationName.trim();
};

export const gqltag = (
  strings: TemplateStringsArray,
  ...args: any
): GQLTagData => {
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    query += args[i] ?? '';
  }
  const operationName = extractOperationName(query);
  const result: GQLTagData = {
    query,
    operationName,
  };
  return result;
};
