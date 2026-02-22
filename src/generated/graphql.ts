import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
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
  readonly __typename?: 'Airplane';
  readonly capacity: Scalars['Int']['output'];
  readonly id: Scalars['ID']['output'];
  readonly size: Scalars['Int']['output'];
  readonly type: Scalars['String']['output'];
};

export type AirplaneChangeEvent = {
  readonly __typename?: 'AirplaneChangeEvent';
  readonly id?: Maybe<Scalars['ID']['output']>;
  readonly item?: Maybe<Airplane>;
  readonly op: ChangeOp;
  readonly v: Scalars['Int']['output'];
};

export type AirplaneInput = {
  readonly capacity: Scalars['Int']['input'];
  readonly id: Scalars['ID']['input'];
  readonly size: Scalars['Int']['input'];
  readonly type: Scalars['String']['input'];
};

export type AirplanesPage = {
  readonly __typename?: 'AirplanesPage';
  readonly hasMore: Scalars['Boolean']['output'];
  readonly hasPrev: Scalars['Boolean']['output'];
  readonly items: ReadonlyArray<Airplane>;
  readonly nextCursor?: Maybe<Scalars['Int']['output']>;
  readonly prevCursor?: Maybe<Scalars['Int']['output']>;
  readonly total: Scalars['Int']['output'];
};

export type ChangeOp =
  | 'remove'
  | 'upsert';

export type Direction =
  | 'down'
  | 'up';

export type FiltersInput = {
  readonly capacityFrom?: InputMaybe<Scalars['Int']['input']>;
  readonly capacityTo?: InputMaybe<Scalars['Int']['input']>;
  readonly id?: InputMaybe<Scalars['String']['input']>;
  readonly sizeFrom?: InputMaybe<Scalars['Int']['input']>;
  readonly sizeTo?: InputMaybe<Scalars['Int']['input']>;
  readonly types?: InputMaybe<ReadonlyArray<Scalars['String']['input']>>;
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly createAirplane: Airplane;
  readonly removeAirplane: Scalars['Boolean']['output'];
  readonly updateAirplane: Airplane;
};


export type MutationCreateAirplaneArgs = {
  input: AirplaneInput;
};


export type MutationRemoveAirplaneArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAirplaneArgs = {
  input: AirplaneInput;
};

export type Query = {
  readonly __typename?: 'Query';
  readonly airplanesPage: AirplanesPage;
  readonly uniqueTypes: ReadonlyArray<Scalars['String']['output']>;
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
  readonly dir: SortDir;
  readonly field: Scalars['String']['input'];
};

export type Subscription = {
  readonly __typename?: 'Subscription';
  readonly airplaneChanged: AirplaneChangeEvent;
};

export type AirplanesPageQueryVariables = Exact<{
  cursor: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  direction: Direction;
  filters?: InputMaybe<FiltersInput>;
  sort?: InputMaybe<SortInput>;
}>;


export type AirplanesPageQuery = { readonly __typename?: 'Query', readonly airplanesPage: { readonly __typename?: 'AirplanesPage', readonly total: number, readonly nextCursor?: number | null, readonly prevCursor?: number | null, readonly hasMore: boolean, readonly hasPrev: boolean, readonly items: ReadonlyArray<{ readonly __typename?: 'Airplane', readonly id: string, readonly type: string, readonly capacity: number, readonly size: number }> } };

export type CreateAirplaneMutationVariables = Exact<{
  input: AirplaneInput;
}>;


export type CreateAirplaneMutation = { readonly __typename?: 'Mutation', readonly createAirplane: { readonly __typename?: 'Airplane', readonly id: string, readonly type: string, readonly capacity: number, readonly size: number } };

export type UpdateAirplaneMutationVariables = Exact<{
  input: AirplaneInput;
}>;


export type UpdateAirplaneMutation = { readonly __typename?: 'Mutation', readonly updateAirplane: { readonly __typename?: 'Airplane', readonly id: string, readonly type: string, readonly capacity: number, readonly size: number } };

export type RemoveAirplaneMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveAirplaneMutation = { readonly __typename?: 'Mutation', readonly removeAirplane: boolean };

export type AirplaneChangedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AirplaneChangedSubscription = { readonly __typename?: 'Subscription', readonly airplaneChanged: { readonly __typename?: 'AirplaneChangeEvent', readonly op: ChangeOp, readonly v: number, readonly id?: string | null, readonly item?: { readonly __typename?: 'Airplane', readonly id: string, readonly type: string, readonly capacity: number, readonly size: number } | null } };

export type UniqueTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type UniqueTypesQuery = { readonly __typename?: 'Query', readonly uniqueTypes: ReadonlyArray<string> };


export const AirplanesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AirplanesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"direction"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Direction"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"FiltersInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SortInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airplanesPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cursor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cursor"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"direction"},"value":{"kind":"Variable","name":{"kind":"Name","value":"direction"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"nextCursor"}},{"kind":"Field","name":{"kind":"Name","value":"prevCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasMore"}},{"kind":"Field","name":{"kind":"Name","value":"hasPrev"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]}}]} as unknown as DocumentNode<AirplanesPageQuery, AirplanesPageQueryVariables>;
export const CreateAirplaneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAirplane"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AirplaneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAirplane"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<CreateAirplaneMutation, CreateAirplaneMutationVariables>;
export const UpdateAirplaneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAirplane"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AirplaneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAirplane"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<UpdateAirplaneMutation, UpdateAirplaneMutationVariables>;
export const RemoveAirplaneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveAirplane"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeAirplane"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveAirplaneMutation, RemoveAirplaneMutationVariables>;
export const AirplaneChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"AirplaneChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"airplaneChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"op"}},{"kind":"Field","name":{"kind":"Name","value":"v"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]}}]} as unknown as DocumentNode<AirplaneChangedSubscription, AirplaneChangedSubscriptionVariables>;
export const UniqueTypesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UniqueTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uniqueTypes"}}]}}]} as unknown as DocumentNode<UniqueTypesQuery, UniqueTypesQueryVariables>;