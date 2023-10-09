export default interface IUserRequest extends Request {
  did: string;
  // TODO: add pubkey to request
  pubkey: string;
}
