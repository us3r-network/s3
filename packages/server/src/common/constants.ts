export const S3_TESTNET_MODELS_USE_COUNT_ZSET = `s3${process.env.NODE_ENV}:testnet:models:usecount:zset`;
export const S3_MAINNET_MODELS_USE_COUNT_ZSET = `s3${process.env.NODE_ENV}:mainnet:models:usecount:zset`;

export const S3_MODEL_GRAPHQL_COMPOSITE_CACHE_PREFIX =
  's3:model:graphql:composite:cache:';
export const S3_MODEL_GRAPHQL_RUNTIMEDEFINITION_CACHE_PREFIX =
  's3:model:graphql:runtimeDefinition:cache:';
export const S3_MODEL_GRAPHQL_GRAPHQLSCHEMA_CACHE_PREFIX =
  's3:model:graphql:graphqlSchema:cache:';
