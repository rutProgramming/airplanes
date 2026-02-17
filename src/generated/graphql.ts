export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Airplane = {
  capacity: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  size: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

export type AirplaneChangeEvent = {
  id?: Maybe<Scalars['ID']['output']>;
  item?: Maybe<Airplane>;
  op: Scalars['String']['output'];
};

export type AirplaneInput = {
  capacity: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  size: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};

export type AirplanesPage = {
  hasMore: Scalars['Boolean']['output'];
  hasPrev: Scalars['Boolean']['output'];
  items: Array<Airplane>;
  nextCursor?: Maybe<Scalars['Int']['output']>;
  prevCursor?: Maybe<Scalars['Int']['output']>;
  total: Scalars['Int']['output'];
};

export type Direction =
  | 'down'
  | 'up';

export type FiltersInput = {
  capacityFrom?: InputMaybe<Scalars['Int']['input']>;
  capacityTo?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  sizeFrom?: InputMaybe<Scalars['Int']['input']>;
  sizeTo?: InputMaybe<Scalars['Int']['input']>;
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Mutation = {
  removeAirplane: Scalars['Boolean']['output'];
  upsertAirplane: Airplane;
};


export type MutationRemoveAirplaneArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpsertAirplaneArgs = {
  input: AirplaneInput;
};

export type Query = {
  airplanesPage: AirplanesPage;
  ping: Scalars['String']['output'];
  uniqueTypes: Array<Scalars['String']['output']>;
};


export type QueryAirplanesPageArgs = {
  cursor: Scalars['Int']['input'];
  direction: Direction;
  filters?: InputMaybe<FiltersInput>;
  limit: Scalars['Int']['input'];
  sort?: InputMaybe<SortInput>;
};

export type SortDir =
  | 'asc'
  | 'desc';

export type SortInput = {
  dir: SortDir;
  field: Scalars['String']['input'];
};

export type Subscription = {
  airplaneChanged: AirplaneChangeEvent;
};

export type AirplanesPageQueryVariables = Exact<{
  cursor: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  direction: Direction;
  filters?: InputMaybe<FiltersInput>;
  sort?: InputMaybe<SortInput>;
}>;


export type AirplanesPageQuery = { airplanesPage: { total: number, nextCursor?: number | null, prevCursor?: number | null, hasMore: boolean, hasPrev: boolean, items: Array<{ id: string, type: string, capacity: number, size: number }> } };

export type UpsertAirplaneMutationVariables = Exact<{
  input: AirplaneInput;
}>;


export type UpsertAirplaneMutation = { upsertAirplane: { id: string, type: string, capacity: number, size: number } };

export type AirplaneChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AirplaneChangedSubscription = { airplaneChanged: { op: string, id?: string | null, item?: { id: string, type: string, capacity: number, size: number } | null } };
