import {
  GQLConnection,
  GQLEdge,
  GQLRequestBody,
  GQLResult,
  GQLTagData,
  QueryExecutor,
} from './types';

const extractOperationName = (query: string): string => {
  let queryBase = query.replace('query', '');
  queryBase = queryBase.replace('mutation', '');
  queryBase = queryBase.replace('fragment', '');
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
/**
 *
 * @param uri
 * @param tagData GQLTagData
 * @param variables
 * @param requestInit
 * @template T Tipo de resultado de la consulta.
 * @template V Tipo de datos de las variables.
 * @template E Tipo de error de la consulta.
 * @returns
 */
export const executeQuery = <T = any, V = any, E = any>(
  uri: string,
  tagData: GQLTagData,
  variables?: V,
  requestInit?: RequestInit | undefined
): Promise<GQLResult<T, E>> => {
  const method = 'POST';
  const { query, operationName } = tagData;
  const basicOptions: RequestInit = { method };
  const initOptions: RequestInit = requestInit ?? {};
  let options = { ...basicOptions, ...initOptions };
  let headers: HeadersInit = requestInit?.headers ?? {};

  const body: GQLRequestBody<V> = {
    query,
    variables,
    operationName,
  };
  headers = { ...headers, 'Content-Type': 'application/json' };
  options = { ...options, headers, body: JSON.stringify(body) };
  return fetch(uri, options).then((response) => response.json());
};

/**
 *
 * @param uri
 * @param requestInit
 * @returns
 */
export const createQueryExecutor = (
  uri: string,
  requestInit?: RequestInit | undefined
): QueryExecutor => {
  return <T = any, V = any, E = any>(
    tagData: GQLTagData,
    variables?: V
  ): Promise<GQLResult<T, E>> =>
    executeQuery(uri, tagData, variables, requestInit);
};

export const extractNodesFromConnection = <T>(
  connection: GQLConnection<T>
): T[] => {
  const edges = connection.edges.reduce(
    (acc: T[], edge: GQLEdge<T>) => acc.concat(edge.node),
    []
  );
  return edges;
};

/**
 * Estandariza los nodos de la conexion utilizando la función pasada como argumento
 * @param connection
 * @param customFn
 * @returns
 */
export const standardizeConnectionCustomFunction = <T>(
  connection: GQLConnection<T>,
  customFn: (e: T) => T
): GQLConnection<T> => {
  const edges = connection.edges.map((edge) => {
    const node =
      typeof customFn === 'function' ? customFn(edge.node) : edge.node;
    return { ...edge, node };
  });
  return { ...connection, edges };
};
