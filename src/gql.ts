/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GQLConnection,
  GQLEdge,
  GQLRequestBody,
  GQLResult,
  GQLQueryObject,
  QueryExecutor,
  GQLQueryData,
  GQLFetchFunction
} from './types';

const extractOperationName = (query: string): string | undefined => {
  let queryBase = query.replace('query', '');
  queryBase = queryBase.replace('mutation', '');
  queryBase = queryBase.replace('fragment', '');
  queryBase = queryBase.trim();
  const regexp = new RegExp(/^(\w+)[\s({}]/);
  const matches = regexp.exec(queryBase) ?? [];
  const operationName = matches[1] ?? '';
  if (typeof operationName == 'string' && operationName.trim().length > 0) {
    return operationName.trim();
  } else {
    return undefined;
  }
};

export const queryDataToQueryObject = (data: GQLQueryData): GQLQueryObject => {
  let queryObject: GQLQueryObject;
  const queryDataGQL: { loc?: { source: { body: string } } } = data as {
    loc?: { source: { body: string } };
  };
  const dataSTR: string = data as string;
  const dataObj: GQLQueryObject = data as GQLQueryObject;
  if (queryDataGQL.loc) {
    queryObject = gqlparse`${queryDataGQL.loc.source.body}`;
  } else if (typeof dataSTR === 'string') {
    queryObject = gqlparse`${dataSTR}`;
  } else {
    queryObject = { ...dataObj };
  }
  return queryObject;
};

export const gqlparse = (strings: TemplateStringsArray, ...args: any): GQLQueryObject => {
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (args[i] && typeof args[i] == 'object' && typeof args[i].query == 'string') {
      query += args[i].query;
    } else if (
      args[i] &&
      typeof args[i] == 'object' &&
      typeof args[i].loc?.source.body == 'string'
    ) {
      query += args[i].loc.source.body;
    } else {
      query += args[i] ?? '';
    }
  }
  const operationName = extractOperationName(query);
  const result: GQLQueryObject = {
    query,
    operationName
  };
  return result;
};
/**
 *
 * @param url
 * @param queryData queryData
 * @param variables
 * @param requestInit
 * @template T Tipo de resultado de la consulta.
 * @template V Tipo de datos de las variables.
 * @template E Tipo de error de la consulta.
 * @returns
 */
export const executeQuery = <T = unknown, V = unknown, E = unknown>(
  url: string,
  queryData: GQLQueryData,
  variables?: V,
  fetchFunction?: GQLFetchFunction,
  requestInit?: RequestInit | undefined
): Promise<GQLResult<T, E>> => {
  const fetchFn = fetchFunction ?? fetch;
  const method = 'POST';
  const queryObject = queryDataToQueryObject(queryData);
  const { query, operationName } = queryObject;
  const basicOptions: RequestInit = { method };
  const initOptions: RequestInit = requestInit ?? {};
  let options = { ...basicOptions, ...initOptions };
  let headers: HeadersInit = requestInit?.headers ?? {};

  const body: GQLRequestBody<V> = {
    query,
    variables,
    operationName
  };
  headers = { ...headers, 'Content-Type': 'application/json' };
  options = { ...options, headers, body: JSON.stringify(body) };

  return fetchFn(url, options).then((response) => response.json());
};

/**
 *
 * @param url
 * @param requestInit
 * @returns
 */
export const createQueryExecutor = (
  url: string,
  fetchFunction?: GQLFetchFunction,
  requestInit?: RequestInit | undefined
): QueryExecutor => {
  return <T = any, V = any, E = any>(
    queryData: GQLQueryData,
    variables?: V
  ): Promise<GQLResult<T, E>> =>
    executeQuery(url, queryData, variables, fetchFunction, requestInit);
};

export const extractNodesFromConnection = <T>(connection: GQLConnection<T>): T[] => {
  const edges = connection.edges.reduce((acc: T[], edge: GQLEdge<T>) => acc.concat(edge.node), []);
  return edges;
};

/**
 * Transforma los nodos de la conexion utilizando la función pasada como argumento
 * @param connection
 * @param mapFn
 * @returns
 */
export const mapConnectionNodes = <T>(
  connection: GQLConnection<T>,
  mapFn: (e: T) => T
): GQLConnection<T> => {
  const edges = connection.edges.map((edge) => {
    const node = typeof mapFn === 'function' ? mapFn(edge.node) : edge.node;
    return { ...edge, node };
  });
  return { ...connection, edges };
};

/**
 * Retorna una funcion que transforma los nodos de la conexion utilizando la función pasada como argumento
 * @param connection
 * @param mapFn
 * @returns
 */
export const mapConnectionNodesF = <T>(mapFn: (e: T) => T) => {
  return (connection: GQLConnection<T>) => mapConnectionNodes(connection, mapFn);
};

export const throwGQLErrors = <T, E>(result: GQLResult<T, E>): GQLResult<T, E> => {
  if (result.errors) {
    throw result.errors;
  }
  return result;
};

export const objectToResponse = (
  data: unknown,
  status: number = 200,
  statusText: string = 'Ok'
): Response => {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  const init = { status, statusText };
  const response = new Response(blob, init);
  return response;
};
