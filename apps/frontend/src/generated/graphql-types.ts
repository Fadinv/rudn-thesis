import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type FutureReturnForecastInput = {
  currency?: InputMaybe<Scalars['String']['input']>;
  dateRange?: InputMaybe<Scalars['String']['input']>;
  forecastHorizons: Array<Scalars['Float']['input']>;
  selectedPercentiles: Array<Scalars['Float']['input']>;
};

export type MarkovitzReportInput = {
  additionalTickers?: InputMaybe<Array<Scalars['String']['input']>>;
  covMethod?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  dateRange?: InputMaybe<Scalars['String']['input']>;
  numPortfolios?: InputMaybe<Scalars['Int']['input']>;
  riskFreeRate?: InputMaybe<Scalars['Float']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addStockToPortfolio: PortfolioStock;
  createFutureReturnForecastGBMReport: PortfolioReport;
  createMarkovitzReport: PortfolioReport;
  createPortfolio: Portfolio;
  createStock: Stock;
  createUser: User;
  deleteAllStocks: Scalars['Boolean']['output'];
  deletePortfolio: Scalars['Boolean']['output'];
  deletePortfolioReport: Scalars['Boolean']['output'];
  deletePortfolioStock: Scalars['Boolean']['output'];
  deleteStock: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  login: Scalars['String']['output'];
  loginByToken: Scalars['String']['output'];
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


export type MutationCreateFutureReturnForecastGbmReportArgs = {
  input: FutureReturnForecastInput;
  portfolioId: Scalars['Int']['input'];
};


export type MutationCreateMarkovitzReportArgs = {
  input: MarkovitzReportInput;
  portfolioId: Scalars['Int']['input'];
};


export type MutationCreatePortfolioArgs = {
  name: Scalars['String']['input'];
  stocks?: InputMaybe<Array<StocksWhileCreatingPortfolio>>;
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


export type MutationDeletePortfolioReportArgs = {
  reportId: Scalars['String']['input'];
};


export type MutationDeletePortfolioStockArgs = {
  portfolioStockId: Scalars['Int']['input'];
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


export type MutationLoginByTokenArgs = {
  token: Scalars['String']['input'];
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
  averagePrice?: InputMaybe<Scalars['Float']['input']>;
  portfolioStockId: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
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
  reports: Array<PortfolioReport>;
  stocks: Array<PortfolioStock>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type PortfolioDistribution = {
  __typename?: 'PortfolioDistribution';
  averagePrices: Array<Scalars['Float']['output']>;
  quantities: Array<Scalars['Int']['output']>;
  remainingCapital: Scalars['Float']['output'];
  stocks: Array<Scalars['String']['output']>;
};

export type PortfolioReport = {
  __typename?: 'PortfolioReport';
  createdAt: Scalars['DateTime']['output'];
  data?: Maybe<Scalars['JSON']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  portfolio: Portfolio;
  reportType: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  getDistributedPortfolioAssets: PortfolioDistribution;
  getPortfolioReport?: Maybe<PortfolioReport>;
  getPortfolioReports: Array<PortfolioReport>;
  getPortfolioStocks: Array<PortfolioStock>;
  getStockById?: Maybe<Stock>;
  getStockByTicker?: Maybe<Stock>;
  getStockPrices: Array<StockPrice>;
  getStocks: Array<Stock>;
  getUserByEmail?: Maybe<User>;
  getUserById?: Maybe<User>;
  getUserPortfolios: Array<Portfolio>;
  getUsers: Array<User>;
  searchStocks: Array<Stock>;
};


export type QueryGetDistributedPortfolioAssetsArgs = {
  capital: Scalars['Float']['input'];
  stockTickerList: Array<Scalars['String']['input']>;
  weights: Array<Scalars['Float']['input']>;
};


export type QueryGetPortfolioReportArgs = {
  reportId: Scalars['String']['input'];
};


export type QueryGetPortfolioReportsArgs = {
  portfolioId: Scalars['Int']['input'];
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


export type QueryGetStockPricesArgs = {
  from?: InputMaybe<Scalars['Float']['input']>;
  ticker: Scalars['String']['input'];
  to?: InputMaybe<Scalars['Float']['input']>;
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
  /** Для отображения или уточнения биржи NASDAQ / MOEX */
  exchange: Scalars['String']['output'];
  id: Scalars['Float']['output'];
  /** Если true - то это индекс */
  isIndex: Scalars['Boolean']['output'];
  lastUpdatedUtc: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  market: Scalars['String']['output'];
  name: Scalars['String']['output'];
  primaryExchange: Scalars['String']['output'];
  shareClassFigi?: Maybe<Scalars['String']['output']>;
  /** Источник данных */
  source: Scalars['String']['output'];
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

export type StockPrice = {
  __typename?: 'StockPrice';
  close: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  high: Scalars['Float']['output'];
  low: Scalars['Float']['output'];
  open: Scalars['Float']['output'];
  ticker: Scalars['String']['output'];
  volume?: Maybe<Scalars['Float']['output']>;
};

export type StocksWhileCreatingPortfolio = {
  averagePrice: Scalars['Float']['input'];
  quantity: Scalars['Int']['input'];
  stockTicker: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  portfolios?: Maybe<Array<Portfolio>>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FutureReturnForecastInput: FutureReturnForecastInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  MarkovitzReportInput: MarkovitzReportInput;
  Mutation: ResolverTypeWrapper<{}>;
  Portfolio: ResolverTypeWrapper<Portfolio>;
  PortfolioDistribution: ResolverTypeWrapper<PortfolioDistribution>;
  PortfolioReport: ResolverTypeWrapper<PortfolioReport>;
  PortfolioStock: ResolverTypeWrapper<PortfolioStock>;
  PortfolioStockUpdateInput: PortfolioStockUpdateInput;
  Query: ResolverTypeWrapper<{}>;
  Stock: ResolverTypeWrapper<Stock>;
  StockInput: StockInput;
  StockPrice: ResolverTypeWrapper<StockPrice>;
  StocksWhileCreatingPortfolio: StocksWhileCreatingPortfolio;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  FutureReturnForecastInput: FutureReturnForecastInput;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  MarkovitzReportInput: MarkovitzReportInput;
  Mutation: {};
  Portfolio: Portfolio;
  PortfolioDistribution: PortfolioDistribution;
  PortfolioReport: PortfolioReport;
  PortfolioStock: PortfolioStock;
  PortfolioStockUpdateInput: PortfolioStockUpdateInput;
  Query: {};
  Stock: Stock;
  StockInput: StockInput;
  StockPrice: StockPrice;
  StocksWhileCreatingPortfolio: StocksWhileCreatingPortfolio;
  String: Scalars['String']['output'];
  User: User;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addStockToPortfolio?: Resolver<ResolversTypes['PortfolioStock'], ParentType, ContextType, RequireFields<MutationAddStockToPortfolioArgs, 'averagePrice' | 'portfolioId' | 'quantity' | 'stockId'>>;
  createFutureReturnForecastGBMReport?: Resolver<ResolversTypes['PortfolioReport'], ParentType, ContextType, RequireFields<MutationCreateFutureReturnForecastGbmReportArgs, 'input' | 'portfolioId'>>;
  createMarkovitzReport?: Resolver<ResolversTypes['PortfolioReport'], ParentType, ContextType, RequireFields<MutationCreateMarkovitzReportArgs, 'input' | 'portfolioId'>>;
  createPortfolio?: Resolver<ResolversTypes['Portfolio'], ParentType, ContextType, RequireFields<MutationCreatePortfolioArgs, 'name'>>;
  createStock?: Resolver<ResolversTypes['Stock'], ParentType, ContextType, RequireFields<MutationCreateStockArgs, 'data'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'email' | 'password'>>;
  deleteAllStocks?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  deletePortfolio?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePortfolioArgs, 'portfolioId'>>;
  deletePortfolioReport?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePortfolioReportArgs, 'reportId'>>;
  deletePortfolioStock?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePortfolioStockArgs, 'portfolioStockId'>>;
  deleteStock?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteStockArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  login?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  loginByToken?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationLoginByTokenArgs, 'token'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  register?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'password'>>;
  updatePortfolio?: Resolver<ResolversTypes['Portfolio'], ParentType, ContextType, RequireFields<MutationUpdatePortfolioArgs, 'newName' | 'portfolioId'>>;
  updatePortfolioStock?: Resolver<ResolversTypes['PortfolioStock'], ParentType, ContextType, RequireFields<MutationUpdatePortfolioStockArgs, 'portfolioStockId'>>;
  updatePortfolioStocks?: Resolver<Array<ResolversTypes['PortfolioStock']>, ParentType, ContextType, RequireFields<MutationUpdatePortfolioStocksArgs, 'updates'>>;
  updateStock?: Resolver<ResolversTypes['Stock'], ParentType, ContextType, RequireFields<MutationUpdateStockArgs, 'data' | 'id'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'email' | 'id'>>;
};

export type PortfolioResolvers<ContextType = any, ParentType extends ResolversParentTypes['Portfolio'] = ResolversParentTypes['Portfolio']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isReadyForAnalysis?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reports?: Resolver<Array<ResolversTypes['PortfolioReport']>, ParentType, ContextType>;
  stocks?: Resolver<Array<ResolversTypes['PortfolioStock']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PortfolioDistributionResolvers<ContextType = any, ParentType extends ResolversParentTypes['PortfolioDistribution'] = ResolversParentTypes['PortfolioDistribution']> = {
  averagePrices?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  quantities?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  remainingCapital?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  stocks?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PortfolioReportResolvers<ContextType = any, ParentType extends ResolversParentTypes['PortfolioReport'] = ResolversParentTypes['PortfolioReport']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  portfolio?: Resolver<ResolversTypes['Portfolio'], ParentType, ContextType>;
  reportType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PortfolioStockResolvers<ContextType = any, ParentType extends ResolversParentTypes['PortfolioStock'] = ResolversParentTypes['PortfolioStock']> = {
  averagePrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  portfolio?: Resolver<ResolversTypes['Portfolio'], ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stock?: Resolver<ResolversTypes['Stock'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  getDistributedPortfolioAssets?: Resolver<ResolversTypes['PortfolioDistribution'], ParentType, ContextType, RequireFields<QueryGetDistributedPortfolioAssetsArgs, 'capital' | 'stockTickerList' | 'weights'>>;
  getPortfolioReport?: Resolver<Maybe<ResolversTypes['PortfolioReport']>, ParentType, ContextType, RequireFields<QueryGetPortfolioReportArgs, 'reportId'>>;
  getPortfolioReports?: Resolver<Array<ResolversTypes['PortfolioReport']>, ParentType, ContextType, RequireFields<QueryGetPortfolioReportsArgs, 'portfolioId'>>;
  getPortfolioStocks?: Resolver<Array<ResolversTypes['PortfolioStock']>, ParentType, ContextType, RequireFields<QueryGetPortfolioStocksArgs, 'portfolioId'>>;
  getStockById?: Resolver<Maybe<ResolversTypes['Stock']>, ParentType, ContextType, RequireFields<QueryGetStockByIdArgs, 'id'>>;
  getStockByTicker?: Resolver<Maybe<ResolversTypes['Stock']>, ParentType, ContextType, RequireFields<QueryGetStockByTickerArgs, 'ticker'>>;
  getStockPrices?: Resolver<Array<ResolversTypes['StockPrice']>, ParentType, ContextType, RequireFields<QueryGetStockPricesArgs, 'ticker'>>;
  getStocks?: Resolver<Array<ResolversTypes['Stock']>, ParentType, ContextType>;
  getUserByEmail?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByEmailArgs, 'email'>>;
  getUserById?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'id'>>;
  getUserPortfolios?: Resolver<Array<ResolversTypes['Portfolio']>, ParentType, ContextType>;
  getUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  searchStocks?: Resolver<Array<ResolversTypes['Stock']>, ParentType, ContextType, RequireFields<QuerySearchStocksArgs, 'search'>>;
};

export type StockResolvers<ContextType = any, ParentType extends ResolversParentTypes['Stock'] = ResolversParentTypes['Stock']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cik?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  compositeFigi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currencyName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  exchange?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  isIndex?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUpdatedUtc?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locale?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  market?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryExchange?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shareClassFigi?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ticker?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StockPriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['StockPrice'] = ResolversParentTypes['StockPrice']> = {
  close?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  high?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  low?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  open?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ticker?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  volume?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  portfolios?: Resolver<Maybe<Array<ResolversTypes['Portfolio']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime?: GraphQLScalarType;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Portfolio?: PortfolioResolvers<ContextType>;
  PortfolioDistribution?: PortfolioDistributionResolvers<ContextType>;
  PortfolioReport?: PortfolioReportResolvers<ContextType>;
  PortfolioStock?: PortfolioStockResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Stock?: StockResolvers<ContextType>;
  StockPrice?: StockPriceResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

