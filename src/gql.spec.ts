import { gqltag } from './gql';

describe('Graphql Tag', () => {
  test('Validando query string', () => {
    const queryString = `
    query QueryTest {

    }`;
    const result = gqltag`
      ${queryString}
    `;
    const inQuery = result.query.includes(queryString);
    expect(inQuery).toEqual(true);
  });
  test('validando query operationName no vars', () => {
    const result = gqltag`query QueryTest {}`;
    expect(result.operationName).toEqual('QueryTest');
  });
  test('validando query operationName with vars', () => {
    const result = gqltag`query QueryTest($id:ID!) {}`;
    expect(result.operationName).toEqual('QueryTest');
  });
  test('validando mutation operationName', () => {
    const result = gqltag`  mutation   MutationTest($id:ID!){}`;
    expect(result.operationName).toEqual('MutationTest');
  });
});
