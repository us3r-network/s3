import { Network } from '../types'

export default function getCurrNetwork() {
  let network = Network.MAINNET
  try {
    const localNetwork = localStorage.getItem('network-select') || '"MAINNET"'
    network = JSON.parse(localNetwork)
  } catch (error) {
    console.error(error)
  }
  return network
}
