import { typeDefinitions } from "./typeDefinitions";

export const schemas = {
  code: `type SimpleProfile @createModel(accountRelation: SINGLE, description: "Very basic profile") {
  displayName: String! @string(minLength: 3, maxLength: 50)
}`,
  library: typeDefinitions,
};
