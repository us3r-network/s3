import { Network } from 'src/entities/stream/stream.entity';

export const importDynamic = new Function(
  'modulePath',
  'return import(modulePath)',
);

export function getCeramicNode(network: Network) {
  return network == Network.MAINNET
    ? process.env.CERAMIC_NODE_MAINET
    : process.env.CERAMIC_NODE;
}

export function getCeramicNodeAdminKey(network: Network) {
  return network == Network.MAINNET
    ? process.env.CERAMIC_NODE_ADMIN_PRIVATE_KEY_MAINNET
    : process.env.CERAMIC_NODE_ADMIN_PRIVATE_KEY;
}

export function createGraphqlDefaultQuery(modelName: string, propertes: any[]) {
  return `
  {
    ${modelName.charAt(0).toLowerCase() + modelName.slice(1)}Index(first: 5) {
      edges {
        node {
          id,${propertes.map((p) => {
            //  `documentAccount` view has not `id`
            if (p[1].type == 'view' && p[1].viewType != 'documentVersion') {
              return p[0] + '{id}';
            } else {
              return p[0] + '';
            }
          })}
        }
      }
    }
  }
  `;
}
