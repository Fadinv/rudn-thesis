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
  quantity: Scalars['Float']['input'];
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
  quantity: Scalars['Float']['input'];
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
  id: Scalars['Int']['output'];
  isReadyForAnalysis: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  stocks: Array<PortfolioStock>;
  user: User;
};

export type PortfolioStock = {
  __typename?: 'PortfolioStock';
  averagePrice?: Maybe<Scalars['Float']['output']>;
  id: Scalars['Int']['output'];
  portfolio: Portfolio;
  quantity?: Maybe<Scalars['Float']['output']>;
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
};


export type QueryGetPortfolioStocksArgs = {
  portfolioId: Scalars['Int']['input'];
};


export type QueryGetStockByIdArgs = {
  id: Scalars['Float']['input'];
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

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser?: { __typename?: 'User', id: number, email: string } | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: string };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };


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