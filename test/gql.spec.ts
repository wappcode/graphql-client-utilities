import gql from 'graphql-tag';
import { executeQuery, gqlparse } from '../src/gql';
import { GQLResult } from '../src/types';
import { describe, test, expect } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();
fetchMocker.dontMock();
describe('Graphql Tag', () => {
  test('Validando query string', () => {
    const queryString = `
    query QueryTest {

    }`;
    const result = gqlparse`
      ${queryString}
    `;
    const inQuery = result.query.includes(queryString);
    expect(inQuery).toEqual(true);
  });
  test('validando query operationName no vars', () => {
    const result = gqlparse`query QueryTest {}`;
    expect(result.operationName).toEqual('QueryTest');
  });
  test('validando query operationName with vars', () => {
    const result = gqlparse`query QueryTest($id:ID!) {}`;
    expect(result.operationName).toEqual('QueryTest');
  });
  test('validando mutation operationName', () => {
    const result = gqlparse`  mutation   MutationTest($id:ID!){}`;
    expect(result.operationName).toEqual('MutationTest');
  });

  test('validando fragment operation name', () => {
    const result = gqlparse`fragment fragmentNameTest on Profile {}`;
    expect(result.operationName).toEqual('fragmentNameTest');
  });
  test('validando query and fragment operation name', () => {
    const fragment = gqlparse`
    fragment UserFragment on User {
      id
      name
    }`;
    const query = gqlparse`
    query QueryX{
      ...UserFragment
    }
    ${fragment}
    `;
    expect(query.operationName).toEqual('QueryX');
    expect(query.query.includes('fragment UserFragment on User')).toBeTruthy();
  });
  test('validando query and fragment gqlparse and gql mezcaldo', () => {
    const fragment = gql`
      fragment UserFragment on User {
        id
        name
      }
      fragment AuthFragment on User {
        id
        name
      }
    `;
    const query = gqlparse`
    query QueryX{
      ...UserFragment
    }
    ${fragment}
    `;
    expect(query.operationName).toEqual('QueryX');
    expect(query.query.includes('fragment UserFragment on User')).toBeTruthy();
  });
  test('validando graphql tag', () => {
    const fragment = gql`
      fragment UserFragment on User {
        id
        name
      }
    `;
    const query = gql`
      query QueryX {
        ...UserFragment
      }
      ${fragment}
    `;
    const queryString = query.loc && query.loc?.source.body;
    expect(typeof queryString).toEqual('string');
  });

  test('probando executeQuery', async () => {
    const query = gql`
      query QueryX {
        id
      }
    `;
    const response: GQLResult = { data: { query: query.loc?.source.body } };

    fetchMocker.mockOnce(JSON.stringify(response));
    const resutl = await executeQuery<{ query: string }>('http://localhost:8080', query);
    expect(resutl.data.query.includes('QueryX')).toBeTruthy();
  });
});
