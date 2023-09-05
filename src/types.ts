export interface GQLTagData {
  query: string;
  operationName?: string;
}
export interface GQLRequestBody<V> {
  query: string;
  operationName?: string;
  variables?: V;
}

export interface GQLEdge<T> {
  cursor: string;
  node: T;
}
export interface GQLPageInfo {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
export interface GQLConnection<T> {
  totalCount: number;
  edges: GQLEdge<T>[];
  pageInfo: GQLPageInfo;
}

export interface GQLPaginationInput {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}
/**
 * @template T Tipo de resultado de la consulta.
 * @template E Tipo de error de la consulta.
 */
export declare type GQLResult<T = any, E = any> = {
  data: T;
  errors?: E[];
};
