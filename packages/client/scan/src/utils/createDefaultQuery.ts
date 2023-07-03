export function createGraphqlDefaultQuery(modelName: string, propertes: any[]) {
  return `
    {
      ${modelName.charAt(0).toLowerCase() + modelName.slice(1)}Index(last: 5) {
        edges {
          node {
            id,${propertes.map((p) => {
              //  `documentAccount` view has not `id`
              if (p[1].type === 'view' && p[1].viewType !== 'documentVersion') {
                return p[0] + '{id}'
              } else {
                return p[0] + ''
              }
            })}
          }
        }
      }
    }
    `
}
