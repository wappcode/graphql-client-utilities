export interface GQLQueryObject {
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

export enum GQLFilterLogic {
  AND = 'AND',
  OR = 'OR'
}

export enum GQLFIlterOperator {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  BETWEEN = 'BETWEEN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_EQUAL_THAN = 'GREATER_EQUAL_THAN',
  LESS_EQUAL_THAN = 'LESS_EQUAL_THAN',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT_LIKE',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  DIFFERENT = 'DIFFERENT',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL'
}

export interface GQLFilterValue {
  single?: string;
  many?: string[];
}
export interface GQLFilterConditionInput {
  filterOperator: GQLFIlterOperator;
  property: string;
  value: GQLFilterValue;
  onJoinedProperty?: string;
}
export interface GQLFilterCompoundConditionInput {
  conditionsLogic?: GQLFilterLogic;
  conditions?: GQLFilterConditionInput[];
  compoundConditions?: GQLFilterCompoundConditionInput[];
}
export interface GQLFilterGroupInput {
  groupLogic?: GQLFilterLogic;
  conditionsLogic?: GQLFilterLogic;
  conditions?: GQLFilterConditionInput[];
  compoundConditions?: GQLFilterCompoundConditionInput[];
}
export enum GQLSortDirection {
  ASC = 'asc',
  DESC = 'desc'
}
export type GQLSortDirectionType = 'ASC' | 'DESC' | 'asc' | 'desc';
export interface GQLSortGroupInput {
  property: string;
  direction?: GQLSortDirection | GQLSortDirectionType;
  onJoinedProperty?: string;
}
export enum GQLJoinType {
  INNER = 'INNER',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  FULL_OUTER = 'FULL_OUTER'
}
export interface GQLJoinInput {
  property: string;
  joinType: GQLJoinType;
  joinedProperty?: string;
  alias?: string;
}

export interface GQLConnectionInput {
  pagination?: GQLPaginationInput;
  filters?: GQLFilterGroupInput[];
  sorts?: GQLSortGroupInput[];
  joins?: GQLJoinInput[];
}
export interface GQLListInput {
  filters?: GQLFilterGroupInput[];
  sorts?: GQLSortGroupInput[];
  joins?: GQLJoinInput[];
}
/**
 * @template T Tipo de resultado de la consulta.
 * @template E Tipo de error de la consulta.
 */
export declare type GQLResult<T = unknown, E = unknown> = {
  data: T;
  errors?: E[];
};

export type GQLQueryData = GQLQueryObject | string | { loc?: { source: { body: string } } };

export type QueryExecutor = <T = unknown, V = unknown, E = unknown>(
  queryData: GQLQueryData,
  variables?: V
) => Promise<GQLResult<T, E>>;

export type GQLFetchFunction = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => Promise<Response>;
