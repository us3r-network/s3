import { importDynamic } from 'src/common/utils';

export enum AccountType {
  SOLANA = 'SOLANA',
  EVM = 'EVM',
  APTOS = 'APTOS',
}

export async function getDidStrFromDidSession(
  didSession: string,
): Promise<string> {
  const { DIDSession } = await importDynamic('did-session');
  const session = await DIDSession.fromSession(didSession);
  return session.id;
}

export async function getCacaoFromDidSession(didSession: string): Promise<any> {
  const { DIDSession } = await importDynamic('did-session');
  const session = await DIDSession.fromSession(didSession);
  return session?.cacao;
}

export async function getSiweMessageFromCacao(cacao: any): Promise<any> {
  const { SiweMessage } = await importDynamic('@didtools/cacao');
  const siweMessage = SiweMessage.fromCacao(cacao);
  return siweMessage;
}

export async function getSiwsMessageFromCacao(cacao: any): Promise<any> {
  const { SiwsMessage } = await importDynamic('@didtools/cacao');
  const siwsMessage = SiwsMessage.fromCacao(cacao);
  return siwsMessage;
}

export async function verifyDidSession(didSession: string): Promise<boolean> {
  const { getEIP191Verifier } = await importDynamic('@didtools/pkh-ethereum');
  const { getSolanaVerifier } = await importDynamic('@didtools/pkh-solana');
  const { Cacao } = await importDynamic('@didtools/cacao');

  const cacao = await getCacaoFromDidSession(didSession);
  const cacaoAccount = await getAccountFromDidSession(didSession);
  if (cacaoAccount[0] == AccountType.EVM) {
    const verifiers = {
      ...getEIP191Verifier(),
    };
    Cacao.verify(cacao, { verifiers });
  } else if (cacaoAccount[0] == AccountType.SOLANA) {
    const verifiers = {
      ...getSolanaVerifier(),
    };
    Cacao.verify(cacao, { verifiers });
  } else {
    return false;
  }

  return true;
}

export async function getAccountFromDidSession(
  didSession: string,
): Promise<any[]> {
  const cacao = await getCacaoFromDidSession(didSession);
  const iss = cacao?.p?.iss as string;
  if (!iss) return;

  const issArr = iss.split(':');
  let chain: string;
  if (issArr[2] == 'eip155') {
    chain = AccountType.EVM;
  } else if (issArr[2] == 'solana') {
    chain = AccountType.SOLANA;
  }
  const pubkey = issArr[4];

  return [chain, pubkey];
}
