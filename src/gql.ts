import {
  GQLConnection,
  GQLEdge,
  GQLRequestBody,
  GQLResult,
  GQLQueryObject,
  QueryExecutor,
  GQLQueryData,
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

export const gqlparse = (
  strings: TemplateStringsArray,
  ...args: any
): GQLQueryObject => {
  let query = '';
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if(args[i] && typeof args[i] == "object" && typeof args[i].query == 'string') {
      query += args[i].query
    } else if(args[i] && typeof args[i] == "object" && typeof args[i].loc?.source.body == "string") { 
      query += args[i].loc.source.body
    }
    else {
      query += args[i] ?? '';

    }
  }
  const operationName = extractOperationName(query);
  const result: GQLQueryObject = {
    query,
    operationName,
  };
  return result;
};
/**
 *
 * @param uri
 * @param queryData queryData
 * @param variables
 * @param requestInit
 * @template T Tipo de resultado de la consulta.
 * @template V Tipo de datos de las variables.
 * @template E Tipo de error de la consulta.
 * @returns
 */
export const executeQuery = <T = any, V = any, E = any>(
  uri: string,
  queryData: GQLQueryData,
  variables?: V,
  requestInit?: RequestInit | undefined
): Promise<GQLResult<T, E>> => {
  const method = 'POST';
  let query, operationName;
  let queryDataGQL: {loc?:{source:{body:string}}} = queryData as {loc?:{source:{body:string}}};
  let queryDataSTR: string = queryData as string;
  let queryDataObj: GQLQueryObject = queryData as GQLQueryObject;
  if(queryDataGQL.loc)  {
    const data = gqlparse`${queryDataGQL.loc.source.body}`;
    query = data.query;
    operationName = data.operationName;
  } else if (typeof queryDataSTR === 'string') {
    const data = gqlparse`${queryDataSTR}`;
    query = data.query;
    operationName = data.operationName;
  } else {
    query = queryDataObj.query;
    operationName = queryDataObj.operationName
  }
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
    queryData: GQLQueryData,
    variables?: V
  ): Promise<GQLResult<T, E>> =>
    executeQuery(uri, queryData, variables, requestInit);
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
export const standardizeConnectionNodesCustomFunction = <T>(
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
