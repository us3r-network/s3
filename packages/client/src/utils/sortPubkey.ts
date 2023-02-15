export function sortPubKey(
  key: string,
  ops?: { len?: number; split?: string }
) {
  const split = ops?.split;
  const len = ops?.len || 4;

  if (split) {
    return key.slice(0, len) + split + key.slice(-len);
  }
  return key.slice(0, len) + '..'.repeat(len / 4) + key.slice(-len);
}
