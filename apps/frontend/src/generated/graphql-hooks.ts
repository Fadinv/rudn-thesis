import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addStockToPortfolio: PortfolioStock;
  createPortfolio: Portfolio;
  createStock: Stock;
  createUser: User;
  deleteAllStocks: Scalars['Boolean']['output'];
  deletePortfolio: Scalars['Boolean']['output'];
  deleteStock: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  login: Scalars['String']['output'];
  logout: Scalars['Boolean']['output'];
  register: Scalars['String']['output'];
  updatePortfolio: Portfolio;
  updatePortfolioStock: PortfolioStock;
  updatePortfolioStocks: Array<PortfolioStock>;
  updateStock: Stock;
  updateUser: User;
};


export type MutationAddStockToPortfolioArgs = {
  averagePrice: Scalars['Float']['input'];
  portfolioId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
  stockId: Scalars['Int']['input'];
};


export type MutationCreatePortfolioArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateStockArgs = {
  data: StockInput;
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationDeletePortfolioArgs = {
  portfolioId: Scalars['Int']['input'];
};


export type MutationDeleteStockArgs = {
  id: Scalars['Float']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Float']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationUpdatePortfolioArgs = {
  newName: Scalars['String']['input'];
  portfolioId: Scalars['Int']['input'];
};


export type MutationUpdatePortfolioStockArgs = {
  averagePrice: Scalars['Float']['input'];
  portfolioStockId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdatePortfolioStocksArgs = {
  updates: Array<PortfolioStockUpdateInput>;
};


export type MutationUpdateStockArgs = {
  data: StockInput;
  id: Scalars['Float']['input'];
};


export type MutationUpdateUserArgs = {
  email: Scalars['String']['input'];
  id: Scalars['Float']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
};

export type Portfolio = {
  __typename?: 'Portfolio';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isReadyForAnalysis: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  stocks: Array<PortfolioStock>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type PortfolioStock = {
  __typename?: 'PortfolioStock';
  averagePrice?: Maybe<Scalars['Float']['output']>;
  id: Scalars['Int']['output'];
  portfolio: Portfolio;
  quantity?: Maybe<Scalars['Int']['output']>;
  stock: Stock;
};

export type PortfolioStockUpdateInput = {
  averagePrice?: InputMaybe<Scalars['Float']['input']>;
  portfolioStockId: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  getPortfolioStocks: Array<PortfolioStock>;
  getStockById?: Maybe<Stock>;
  getStockByTicker?: Maybe<Stock>;
  getStocks: Array<Stock>;
  getUserByEmail?: Maybe<User>;
  getUserById?: Maybe<User>;
  getUserPortfolios: Array<Portfolio>;
  getUsers: Array<User>;
  searchStocks: Array<Stock>;
};


export type QueryGetPortfolioStocksArgs = {
  portfolioId: Scalars['Int']['input'];
};


export type QueryGetStockByIdArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetStockByTickerArgs = {
  ticker: Scalars['String']['input'];
};


export type QueryGetUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['Float']['input'];
};


export type QuerySearchStocksArgs = {
  search: Scalars['String']['input'];
};

export type Stock = {
  __typename?: 'Stock';
  active: Scalars['Boolean']['output'];
  cik?: Maybe<Scalars['String']['output']>;
  compositeFigi?: Maybe<Scalars['String']['output']>;
  currencyName: Scalars['String']['output'];
  id: Scalars['Float']['output'];
  lastUpdatedUtc: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  market: Scalars['String']['output'];
  name: Scalars['String']['output'];
  primaryExchange: Scalars['String']['output'];
  shareClassFigi?: Maybe<Scalars['String']['output']>;
  ticker: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
};

export type StockInput = {
  active: Scalars['Boolean']['input'];
  cik?: InputMaybe<Scalars['String']['input']>;
  compositeFigi?: InputMaybe<Scalars['String']['input']>;
  currencyName: Scalars['String']['input'];
  lastUpdatedUtc: Scalars['String']['input'];
  locale: Scalars['String']['input'];
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  market: Scalars['String']['input'];
  name: Scalars['String']['input'];
  primaryExchange: Scalars['String']['input'];
  shareClassFigi?: InputMaybe<Scalars['String']['input']>;
  ticker: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  portfolios?: Maybe<Array<Portfolio>>;
};

export type AddStockToPortfolioMutationVariables = Exact<{
  portfolioId: Scalars['Int']['input'];
  stockId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
  averagePrice: Scalars['Float']['input'];
}>;


export type AddStockToPortfolioMutation = { __typename?: 'Mutation', addStockToPortfolio: { __typename?: 'PortfolioStock', id: number, quantity?: number | null, averagePrice?: number | null, stock: { __typename?: 'Stock', id: number, ticker: string, name: string } } };

export type CreatePortfolioMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreatePortfolioMutation = { __typename?: 'Mutation', createPortfolio: { __typename?: 'Portfolio', id: number, name: string, createdAt: any } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser?: { __typename?: 'User', id: number, email: string } | null };

export type DeletePortfolioMutationVariables = Exact<{
  portfolioId: Scalars['Int']['input'];
}>;


export type DeletePortfolioMutation = { __typename?: 'Mutation', deletePortfolio: boolean };

export type GetPortfolioStocksQueryVariables = Exact<{
  portfolioId: Scalars['Int']['input'];
}>;


export type GetPortfolioStocksQuery = { __typename?: 'Query', getPortfolioStocks: Array<{ __typename?: 'PortfolioStock', id: number, quantity?: number | null, averagePrice?: number | null, stock: { __typename?: 'Stock', id: number, ticker: string, name: string } }> };

export type GetStockByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetStockByIdQuery = { __typename?: 'Query', getStockById?: { __typename?: 'Stock', id: number, ticker: string, name: string, market: string, primaryExchange: string, currencyName: string, logoUrl?: string | null } | null };

export type GetStockByTickerQueryVariables = Exact<{
  ticker: Scalars['String']['input'];
}>;


export type GetStockByTickerQuery = { __typename?: 'Query', getStockByTicker?: { __typename?: 'Stock', id: number, ticker: string, name: string, market: string, primaryExchange: string, currencyName: string, logoUrl?: string | null } | null };

export type GetUserPortfoliosQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserPortfoliosQuery = { __typename?: 'Query', getUserPortfolios: Array<{ __typename?: 'Portfolio', id: number, name: string, createdAt: any }> };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: string };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type SearchStocksQueryVariables = Exact<{
  search: Scalars['String']['input'];
}>;


export type SearchStocksQuery = { __typename?: 'Query', searchStocks: Array<{ __typename?: 'Stock', id: number, ticker: string, name: string }> };

export type UpdatePortfolioMutationVariables = Exact<{
  portfolioId: Scalars['Int']['input'];
  newName: Scalars['String']['input'];
}>;


export type UpdatePortfolioMutation = { __typename?: 'Mutation', updatePortfolio: { __typename?: 'Portfolio', id: number, name: string } };

export type UpdatePortfolioStockMutationVariables = Exact<{
  portfolioStockId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
  averagePrice: Scalars['Float']['input'];
}>;


export type UpdatePortfolioStockMutation = { __typename?: 'Mutation', updatePortfolioStock: { __typename?: 'PortfolioStock', id: number, quantity?: number | null, averagePrice?: number | null } };

export type UpdatePortfolioStocksMutationVariables = Exact<{
  updates: Array<PortfolioStockUpdateInput> | PortfolioStockUpdateInput;
}>;


export type UpdatePortfolioStocksMutation = { __typename?: 'Mutation', updatePortfolioStocks: Array<{ __typename?: 'PortfolioStock', id: number, quantity?: number | null, averagePrice?: number | null }> };


export const AddStockToPortfolioDocument = gql`
    mutation AddStockToPortfolio($portfolioId: Int!, $stockId: Int!, $quantity: Int!, $averagePrice: Float!) {
  addStockToPortfolio(
    portfolioId: $portfolioId
    stockId: $stockId
    quantity: $quantity
    averagePrice: $averagePrice
  ) {
    id
    quantity
    averagePrice
    stock {
      id
      ticker
      name
    }
  }
}
    `;
export type AddStockToPortfolioMutationFn = Apollo.MutationFunction<AddStockToPortfolioMutation, AddStockToPortfolioMutationVariables>;

/**
 * __useAddStockToPortfolioMutation__
 *
 * To run a mutation, you first call `useAddStockToPortfolioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddStockToPortfolioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addStockToPortfolioMutation, { data, loading, error }] = useAddStockToPortfolioMutation({
 *   variables: {
 *      portfolioId: // value for 'portfolioId'
 *      stockId: // value for 'stockId'
 *      quantity: // value for 'quantity'
 *      averagePrice: // value for 'averagePrice'
 *   },
 * });
 */
export function useAddStockToPortfolioMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddStockToPortfolioMutation, AddStockToPortfolioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddStockToPortfolioMutation, AddStockToPortfolioMutationVariables>(AddStockToPortfolioDocument, options);
      }
export type AddStockToPortfolioMutationHookResult = ReturnType<typeof useAddStockToPortfolioMutation>;
export type AddStockToPortfolioMutationResult = Apollo.MutationResult<AddStockToPortfolioMutation>;
export type AddStockToPortfolioMutationOptions = Apollo.BaseMutationOptions<AddStockToPortfolioMutation, AddStockToPortfolioMutationVariables>;
export const CreatePortfolioDocument = gql`
    mutation CreatePortfolio($name: String!) {
  createPortfolio(name: $name) {
    id
    name
    createdAt
  }
}
    `;
export type CreatePortfolioMutationFn = Apollo.MutationFunction<CreatePortfolioMutation, CreatePortfolioMutationVariables>;

/**
 * __useCreatePortfolioMutation__
 *
 * To run a mutation, you first call `useCreatePortfolioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePortfolioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPortfolioMutation, { data, loading, error }] = useCreatePortfolioMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useCreatePortfolioMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreatePortfolioMutation, CreatePortfolioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreatePortfolioMutation, CreatePortfolioMutationVariables>(CreatePortfolioDocument, options);
      }
export type CreatePortfolioMutationHookResult = ReturnType<typeof useCreatePortfolioMutation>;
export type CreatePortfolioMutationResult = Apollo.MutationResult<CreatePortfolioMutation>;
export type CreatePortfolioMutationOptions = Apollo.BaseMutationOptions<CreatePortfolioMutation, CreatePortfolioMutationVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  currentUser {
    id
    email
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export function useCurrentUserSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const DeletePortfolioDocument = gql`
    mutation DeletePortfolio($portfolioId: Int!) {
  deletePortfolio(portfolioId: $portfolioId)
}
    `;
export type DeletePortfolioMutationFn = Apollo.MutationFunction<DeletePortfolioMutation, DeletePortfolioMutationVariables>;

/**
 * __useDeletePortfolioMutation__
 *
 * To run a mutation, you first call `useDeletePortfolioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePortfolioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePortfolioMutation, { data, loading, error }] = useDeletePortfolioMutation({
 *   variables: {
 *      portfolioId: // value for 'portfolioId'
 *   },
 * });
 */
export function useDeletePortfolioMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeletePortfolioMutation, DeletePortfolioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeletePortfolioMutation, DeletePortfolioMutationVariables>(DeletePortfolioDocument, options);
      }
export type DeletePortfolioMutationHookResult = ReturnType<typeof useDeletePortfolioMutation>;
export type DeletePortfolioMutationResult = Apollo.MutationResult<DeletePortfolioMutation>;
export type DeletePortfolioMutationOptions = Apollo.BaseMutationOptions<DeletePortfolioMutation, DeletePortfolioMutationVariables>;
export const GetPortfolioStocksDocument = gql`
    query GetPortfolioStocks($portfolioId: Int!) {
  getPortfolioStocks(portfolioId: $portfolioId) {
    id
    quantity
    averagePrice
    stock {
      id
      ticker
      name
    }
  }
}
    `;

/**
 * __useGetPortfolioStocksQuery__
 *
 * To run a query within a React component, call `useGetPortfolioStocksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPortfolioStocksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPortfolioStocksQuery({
 *   variables: {
 *      portfolioId: // value for 'portfolioId'
 *   },
 * });
 */
export function useGetPortfolioStocksQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables> & ({ variables: GetPortfolioStocksQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables>(GetPortfolioStocksDocument, options);
      }
export function useGetPortfolioStocksLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables>(GetPortfolioStocksDocument, options);
        }
export function useGetPortfolioStocksSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables>(GetPortfolioStocksDocument, options);
        }
export type GetPortfolioStocksQueryHookResult = ReturnType<typeof useGetPortfolioStocksQuery>;
export type GetPortfolioStocksLazyQueryHookResult = ReturnType<typeof useGetPortfolioStocksLazyQuery>;
export type GetPortfolioStocksSuspenseQueryHookResult = ReturnType<typeof useGetPortfolioStocksSuspenseQuery>;
export type GetPortfolioStocksQueryResult = Apollo.QueryResult<GetPortfolioStocksQuery, GetPortfolioStocksQueryVariables>;
export const GetStockByIdDocument = gql`
    query getStockById($id: Int!) {
  getStockById(id: $id) {
    id
    ticker
    name
    market
    primaryExchange
    currencyName
    logoUrl
  }
}
    `;

/**
 * __useGetStockByIdQuery__
 *
 * To run a query within a React component, call `useGetStockByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStockByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStockByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetStockByIdQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetStockByIdQuery, GetStockByIdQueryVariables> & ({ variables: GetStockByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetStockByIdQuery, GetStockByIdQueryVariables>(GetStockByIdDocument, options);
      }
export function useGetStockByIdLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetStockByIdQuery, GetStockByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetStockByIdQuery, GetStockByIdQueryVariables>(GetStockByIdDocument, options);
        }
export function useGetStockByIdSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetStockByIdQuery, GetStockByIdQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetStockByIdQuery, GetStockByIdQueryVariables>(GetStockByIdDocument, options);
        }
export type GetStockByIdQueryHookResult = ReturnType<typeof useGetStockByIdQuery>;
export type GetStockByIdLazyQueryHookResult = ReturnType<typeof useGetStockByIdLazyQuery>;
export type GetStockByIdSuspenseQueryHookResult = ReturnType<typeof useGetStockByIdSuspenseQuery>;
export type GetStockByIdQueryResult = Apollo.QueryResult<GetStockByIdQuery, GetStockByIdQueryVariables>;
export const GetStockByTickerDocument = gql`
    query getStockByTicker($ticker: String!) {
  getStockByTicker(ticker: $ticker) {
    id
    ticker
    name
    market
    primaryExchange
    currencyName
    logoUrl
  }
}
    `;

/**
 * __useGetStockByTickerQuery__
 *
 * To run a query within a React component, call `useGetStockByTickerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStockByTickerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStockByTickerQuery({
 *   variables: {
 *      ticker: // value for 'ticker'
 *   },
 * });
 */
export function useGetStockByTickerQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetStockByTickerQuery, GetStockByTickerQueryVariables> & ({ variables: GetStockByTickerQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetStockByTickerQuery, GetStockByTickerQueryVariables>(GetStockByTickerDocument, options);
      }
export function useGetStockByTickerLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetStockByTickerQuery, GetStockByTickerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetStockByTickerQuery, GetStockByTickerQueryVariables>(GetStockByTickerDocument, options);
        }
export function useGetStockByTickerSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetStockByTickerQuery, GetStockByTickerQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetStockByTickerQuery, GetStockByTickerQueryVariables>(GetStockByTickerDocument, options);
        }
export type GetStockByTickerQueryHookResult = ReturnType<typeof useGetStockByTickerQuery>;
export type GetStockByTickerLazyQueryHookResult = ReturnType<typeof useGetStockByTickerLazyQuery>;
export type GetStockByTickerSuspenseQueryHookResult = ReturnType<typeof useGetStockByTickerSuspenseQuery>;
export type GetStockByTickerQueryResult = Apollo.QueryResult<GetStockByTickerQuery, GetStockByTickerQueryVariables>;
export const GetUserPortfoliosDocument = gql`
    query GetUserPortfolios {
  getUserPortfolios {
    id
    name
    createdAt
  }
}
    `;

/**
 * __useGetUserPortfoliosQuery__
 *
 * To run a query within a React component, call `useGetUserPortfoliosQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserPortfoliosQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserPortfoliosQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserPortfoliosQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>(GetUserPortfoliosDocument, options);
      }
export function useGetUserPortfoliosLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>(GetUserPortfoliosDocument, options);
        }
export function useGetUserPortfoliosSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>(GetUserPortfoliosDocument, options);
        }
export type GetUserPortfoliosQueryHookResult = ReturnType<typeof useGetUserPortfoliosQuery>;
export type GetUserPortfoliosLazyQueryHookResult = ReturnType<typeof useGetUserPortfoliosLazyQuery>;
export type GetUserPortfoliosSuspenseQueryHookResult = ReturnType<typeof useGetUserPortfoliosSuspenseQuery>;
export type GetUserPortfoliosQueryResult = Apollo.QueryResult<GetUserPortfoliosQuery, GetUserPortfoliosQueryVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password)
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const SearchStocksDocument = gql`
    query SearchStocks($search: String!) {
  searchStocks(search: $search) {
    id
    ticker
    name
  }
}
    `;

/**
 * __useSearchStocksQuery__
 *
 * To run a query within a React component, call `useSearchStocksQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchStocksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchStocksQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useSearchStocksQuery(baseOptions: ApolloReactHooks.QueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables> & ({ variables: SearchStocksQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SearchStocksQuery, SearchStocksQueryVariables>(SearchStocksDocument, options);
      }
export function useSearchStocksLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SearchStocksQuery, SearchStocksQueryVariables>(SearchStocksDocument, options);
        }
export function useSearchStocksSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<SearchStocksQuery, SearchStocksQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<SearchStocksQuery, SearchStocksQueryVariables>(SearchStocksDocument, options);
        }
export type SearchStocksQueryHookResult = ReturnType<typeof useSearchStocksQuery>;
export type SearchStocksLazyQueryHookResult = ReturnType<typeof useSearchStocksLazyQuery>;
export type SearchStocksSuspenseQueryHookResult = ReturnType<typeof useSearchStocksSuspenseQuery>;
export type SearchStocksQueryResult = Apollo.QueryResult<SearchStocksQuery, SearchStocksQueryVariables>;
export const UpdatePortfolioDocument = gql`
    mutation UpdatePortfolio($portfolioId: Int!, $newName: String!) {
  updatePortfolio(portfolioId: $portfolioId, newName: $newName) {
    id
    name
  }
}
    `;
export type UpdatePortfolioMutationFn = Apollo.MutationFunction<UpdatePortfolioMutation, UpdatePortfolioMutationVariables>;

/**
 * __useUpdatePortfolioMutation__
 *
 * To run a mutation, you first call `useUpdatePortfolioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePortfolioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePortfolioMutation, { data, loading, error }] = useUpdatePortfolioMutation({
 *   variables: {
 *      portfolioId: // value for 'portfolioId'
 *      newName: // value for 'newName'
 *   },
 * });
 */
export function useUpdatePortfolioMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdatePortfolioMutation, UpdatePortfolioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdatePortfolioMutation, UpdatePortfolioMutationVariables>(UpdatePortfolioDocument, options);
      }
export type UpdatePortfolioMutationHookResult = ReturnType<typeof useUpdatePortfolioMutation>;
export type UpdatePortfolioMutationResult = Apollo.MutationResult<UpdatePortfolioMutation>;
export type UpdatePortfolioMutationOptions = Apollo.BaseMutationOptions<UpdatePortfolioMutation, UpdatePortfolioMutationVariables>;
export const UpdatePortfolioStockDocument = gql`
    mutation UpdatePortfolioStock($portfolioStockId: Int!, $quantity: Int!, $averagePrice: Float!) {
  updatePortfolioStock(
    portfolioStockId: $portfolioStockId
    quantity: $quantity
    averagePrice: $averagePrice
  ) {
    id
    quantity
    averagePrice
  }
}
    `;
export type UpdatePortfolioStockMutationFn = Apollo.MutationFunction<UpdatePortfolioStockMutation, UpdatePortfolioStockMutationVariables>;

/**
 * __useUpdatePortfolioStockMutation__
 *
 * To run a mutation, you first call `useUpdatePortfolioStockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePortfolioStockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePortfolioStockMutation, { data, loading, error }] = useUpdatePortfolioStockMutation({
 *   variables: {
 *      portfolioStockId: // value for 'portfolioStockId'
 *      quantity: // value for 'quantity'
 *      averagePrice: // value for 'averagePrice'
 *   },
 * });
 */
export function useUpdatePortfolioStockMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdatePortfolioStockMutation, UpdatePortfolioStockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdatePortfolioStockMutation, UpdatePortfolioStockMutationVariables>(UpdatePortfolioStockDocument, options);
      }
export type UpdatePortfolioStockMutationHookResult = ReturnType<typeof useUpdatePortfolioStockMutation>;
export type UpdatePortfolioStockMutationResult = Apollo.MutationResult<UpdatePortfolioStockMutation>;
export type UpdatePortfolioStockMutationOptions = Apollo.BaseMutationOptions<UpdatePortfolioStockMutation, UpdatePortfolioStockMutationVariables>;
export const UpdatePortfolioStocksDocument = gql`
    mutation UpdatePortfolioStocks($updates: [PortfolioStockUpdateInput!]!) {
  updatePortfolioStocks(updates: $updates) {
    id
    quantity
    averagePrice
  }
}
    `;
export type UpdatePortfolioStocksMutationFn = Apollo.MutationFunction<UpdatePortfolioStocksMutation, UpdatePortfolioStocksMutationVariables>;

/**
 * __useUpdatePortfolioStocksMutation__
 *
 * To run a mutation, you first call `useUpdatePortfolioStocksMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePortfolioStocksMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePortfolioStocksMutation, { data, loading, error }] = useUpdatePortfolioStocksMutation({
 *   variables: {
 *      updates: // value for 'updates'
 *   },
 * });
 */
export function useUpdatePortfolioStocksMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdatePortfolioStocksMutation, UpdatePortfolioStocksMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdatePortfolioStocksMutation, UpdatePortfolioStocksMutationVariables>(UpdatePortfolioStocksDocument, options);
      }
export type UpdatePortfolioStocksMutationHookResult = ReturnType<typeof useUpdatePortfolioStocksMutation>;
export type UpdatePortfolioStocksMutationResult = Apollo.MutationResult<UpdatePortfolioStocksMutation>;
export type UpdatePortfolioStocksMutationOptions = Apollo.BaseMutationOptions<UpdatePortfolioStocksMutation, UpdatePortfolioStocksMutationVariables>;