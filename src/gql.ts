import { GQLRequestBody, GQLTagData } from './types';

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

export const executeQuery = (
  uri: string,
  { query, operationName }: GQLTagData,
  variables?: any,
  requestInit?: RequestInit | undefined
): Promise<any> => {
  const method = 'POST';
  const basicOptions: RequestInit = { method };
  const initOptions: RequestInit = requestInit ?? {};
  let options = { ...basicOptions, ...initOptions };
  let headers: HeadersInit = requestInit?.headers ?? {};

  const body: GQLRequestBody = {
    query,
    variables,
    operationName,
  };
  headers = { ...headers, 'Content-Type': 'application/json' };
  options = { ...options, headers, body: JSON.stringify(body) };
  return fetch(uri, options).then((response) => response.json());
};
