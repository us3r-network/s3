import { S3ModelCollectionModel } from "@us3r-network/model-collection";
import { CERAMIC_HOST } from "../constants";


export const s3ModelCollection = new S3ModelCollectionModel(
  CERAMIC_HOST,
);
