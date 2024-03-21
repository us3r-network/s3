import { ModelStream } from '../../types'
import { typeDefinitions } from './typeDefinitions'

export const schemas = {
  code: `type SimpleProfile @createModel(accountRelation: SINGLE, description: "Very basic profile") {
  displayName: String! @string(minLength: 3, maxLength: 50)
}`,
  library: typeDefinitions,
}

const TINT_WORD = `# Edit the model's relation based on your business needs.
# See Example below
# https://composedb.js.org/docs/0.4.x/guides/data-modeling/relations-container-of-items

`

export const getCompositeDefaultSchema = (dappModels: ModelStream[]) => {
 return TINT_WORD +
  dappModels
    .map((item) => {
      return `
        type ${item.stream_content.name} @loadModel(id: "${item.stream_id}") {
        id: ID!
        }
        `
    })
    .join('\n')
}