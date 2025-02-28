# Graphql Client Utilities

Utilidades para consultas grapql. Definición de tipos typescript compatibles con las librerias wappcode/gqlpdss de php y com.wappcode.java.graphql gql-utilities de java

## Funciones

### gqlparse

Convierte una cadena en un objeto GQLQueryObject que se puede utilizar para realizar la consulta

```
    gqlparse` query QueryName {
        ...
    }`
    // output  {query: 'query QueryName {...}', operationName:'QueryName'}
```

### executeQuery

Ejecuta la consulta http. Puede aceptar como valor de la consulta una cadena, un objeto GQLQueryObject creado con la funcion gqlparse o un objeto DocumentNode creado por la función gql de la librería grapql-tag

Parámetros

- url: String con la url de la api
- queryData: Contenido del query GQLQueryData (string, GQLQueryObject ,DocumentNode )
  variables?: (opcional) variables que se van a agregar a la consulta
  fetchFunction?: GQLFetchFunction (opcional) funcion que se utiliza para hacer la consulta de forma predeterminada usa la funcion fetch del objeto window
  requestInit?: RequestInit (opcional) Opciones que se agregan a la consulta como por ejemplo encabezados

```
    // consulta con GQLQueryObject
    const queryObject = gqlparse`
    query QueryName {
        ...
    }`
    const result = await executeQuery('http:localhost:8080/api',queryObject)

    // consulta con DocumentNode
    const queryDocument = gql`
    query QueryName {
        ...
    }`
    const result = await executeQuery('http:localhost:8080/api',queryDocument)

    // consulta con cadena
    const query = `
    query QueryName {
        ...
    }`
    const result = await executeQuery('http:localhost:8080/api',query)

```

### createQueryExecutor

Crea una funcion (executor) con la configuración general para hacer las solicitudes a la api graphql

Parámetros

- url: String con la url de la api
- fetchFunction?: GQLFetchFunction (opcional) funcion que se utiliza para hacer la consulta de forma predeterminada usa la funcion fetch del objeto window
- requestInit?: RequestInit (opcional) Opciones que se agregan a la consulta como por ejemplo encabezados

```
    const executor = createQueryExecutor('http:localhost:8080/api'
    )
    // consulta con GQLQueryObject
    const queryObject = gqlparse`
    query QueryName {
        ...
    }`
    const result = await executor(queryObject)

    // consulta con DocumentNode
    const queryDocument = gql`
    query QueryName {
        ...
    }`
    const result = await executor(queryDocument)

    // consulta con cadena
    const query = `
    query QueryName {
        ...
    }`
    const result = await executor(query)

```

### extractNodesFromConnection

Extrae los nodos de los edges de una consulta de tipo connection

Parámetros

- connection: GQLConnection Resultado de la consulta connection a la api grapql

```

    // Query response example
    // {..., edges:[{cursor:"1",node:{id:1}},{cursor:"2",node:{id:2}}]}

    const nodes = extractNodesFromConnection(connectionResponse)
    //output  [{id:1},{id:2}]

    const queryConnection = gqlparse` query {....}`
    const nodes = await executor(queryConnection).then(extractNodesFromConnection)
    //output  [{id:1},{id:2}]
```

### mapConnectionNodes, mapConnectionNodesF

Estandariza los nodes del resultado de una consulta graphql tipo connection

Parámetros

- connection: GQLConnection Resultado de la consulta connection a la api grapql
- customFn: Función que estandariza a un node de forma individual

```

    // Query response example
    // {..., edges:[{cursor:"1",node:{date:'2023-11-10'}},{cursor:"2",node:{date:'2023-11-11'}}]}

    // Convierte las cadenas de fecha en objetos fecha
    const mapFn = (e) => {...e, date: new Date(e.date)}

    const connectionData  = mapConnectionNodes(connectionResponse,mapFn)
    //output  [{date: [object]},{date: [object]}]

    const queryConnection = gqlparse` query {....}`
    const connectionData  = await executor(queryConnection)
    .then(mapConnectionNodesF(mapFn))
    //output  [{date: [object]},{date: [object]}]
```

### throwGQLErrors

Lanza una excepción si hay algun error en la consulta Graphql

Parámetros

- result: GQLResult Resultado de la consulta GQL

```
 const queryConnection = gqlparse` query {....}`
    const connectionData  = await executor(queryConnection)
    .then(throwGQLErrors)
    ...
```

## Tipos definidos para

```
GQLEdge<T> {
cursor: string;
node: T;
}

GQLPageInfo {
startCursor: string;
endCursor: string;
hasNextPage: boolean;
hasPreviousPage: boolean;
}
GQLConnection<T> {
totalCount: number;
edges: GQLEdge<T>[];
pageInfo: GQLPageInfo;
}

GQLPaginationInput {
first?: number;
after?: string;
last?: number;
before?: string;
}

enum GQLFilterLogic {
AND = 'AND',
OR = 'OR',
}

enum GQLFIlterOperator {
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
}

GQLFilterValue {
single?: string;
many?: string[];
}

GQLFilterConditionInput {
filterOperator: GQLFIlterOperator;
property: string;
value: GQLFilterValue;
onJoinedProperty: string;
}

GQLFilterGroupInput {
groupLogic?: GQLFilterLogic;
conditionsLogic?: GQLFilterLogic;
conditions: GQLFilterConditionInput;
}
GQLSortDirection {
ASC = 'ASC',
DESC = 'DESC',
}

GQLSortGroupInput {
property: string;
direction?: GQLSortDirection;
onJoinedProperty: string;
}

enum GQLJoinType {
INNER = 'INNER',
LEFT = 'LEFT',
RIGHT = 'RIGHT',
FULL_OUTER = 'FULL_OUTER',
}

GQLJoinInput {
property: string;
joinType: GQLJoinType;
joinedProperty: string;
alias: string;
}

GQLConnectionInput {
pagination?: GQLPaginationInput;
filters?: GQLFilterGroupInput[];
sorts?: GQLSortGroupInput[];
joins?: GQLJoinInput[];
}
GQLListInput {
filters?: GQLFilterGroupInput[];
sorts?: GQLSortGroupInput[];
joins?: GQLJoinInput[];
}

```

## Integración con angular

- Importar o inicializar provider HttpClientModule para módulos o provideHttpClient(withFetch()) para standalone component
- Crear el servicio

ng g s services/query-executor

```
// services/query-executor.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  createQueryExecutor,
  GQLFetchFunction,
  GQLQueryData,
  GQLResult,
  objectToResponse,
} from 'graphql-client-utilities';
import { firstValueFrom, from, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QueryExecutorService {
  constructor(private http: HttpClient) {}
  createExecutor() {
    const fetchFn: GQLFetchFunction = (
      url: RequestInfo | URL,
      init?: RequestInit | undefined
    ): Promise<Response> => {
      const body = init?.body;
      const observable$ = this.http.post(url as string, body);
      return firstValueFrom(observable$).then((result) =>
        objectToResponse(result)
      );
    };
    const queryExecutor = createQueryExecutor(
      'http://localhost:8080/api',
      fetchFn
    );
    return queryExecutor;
  }

  execute<T = unknown, V = unknown, E = unknown>(
    query: GQLQueryData,
    vars?: V
  ): Observable<GQLResult<T, E>> {
    const queryExecutor = this.createExecutor();
    return from(queryExecutor<T, V, E>(query, vars));
  }
}

```

- ejecutar un query en el componente

```

import { QueryExecutorService } from './services/query-executor.service';
import {queryExecutor, gqlparse} from 'graphql-client-utilities';
import { from, map, tap } from 'rxjs';
// importar provider en le componente o módulo


.....

    constructor(private: queryExecutor: QueryExecutorService){

    }
    // ejecutar un query

      const query = gqlparse`
        query QueryEcho($message:String!){
          echo(message:$message)
        }
        `;
    this.queryExecutor
      .execute<{ echo: string }>(query,{message:"hola mundo"})
      .pipe(
        map((result) => result.data.echo + ' awesome!'),
        tap((result) => console.log(result))
        // ... realizar los procesos con los datos tap, map, etc
      )
      .subscribe();


    // o alternativamente de la siguiente forma

    const queryExecutor = this.queryExecutor.createExecutor();

    from(queryExecutor<{echo:string}>(query,{message:"hola mundo"})).pipe(
        map((result) => result.data.echo + ' awesome!'),
        tap((result) => console.log(result))
        // ... realizar los procesos con los datos tap, map, etc
    ).subscribe();

.....



```
