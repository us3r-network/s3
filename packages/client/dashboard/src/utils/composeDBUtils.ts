import { CeramicApi } from '@ceramicnetwork/common'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { Composite } from '@composedb/devtools'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { DIDSession } from 'did-session'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays/from-string'

export async function createCompositeFromBrowser(
  graphql: string,
  myCeramicNode: string = '',
  myCeramicNodeAdminPrivateKey: string = '',
  pkhSession: DIDSession | null = null,
  index: boolean = false,
) {
  console.log('graphql string: ', graphql)
  if (!graphql) {
    console.error("Please specify model's graphql string")
    return
  }
  if (!myCeramicNode) {
    console.error('Please specify a Ceramic node')
    return
  }
  // 0 Login
  console.log('Connecting to the ceramic node: ', myCeramicNode)
  const ceramic = new CeramicClient(myCeramicNode)
  try {
    // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
    // Replace the example key here by your admin private key
    if (myCeramicNodeAdminPrivateKey && myCeramicNode) {
      const privateKey = fromString(myCeramicNodeAdminPrivateKey, 'base16')
      const did = new DID({
        resolver: getResolver(),
        provider: new Ed25519Provider(privateKey),
      })
      await did.authenticate()
      // An authenticated DID with admin access must be set on the Ceramic instance
      ceramic.did = did
    } else if (pkhSession) {
      ceramic.did = pkhSession.did
    }
    else {
      const ethProvider = (window as any).ethereum
      const addresses = await ethProvider.enable()
      const accountId = await getAccountId(ethProvider, addresses[0])
      const authMethod = await EthereumWebAuth.getAuthMethod(
        ethProvider,
        accountId
      )
      const session = await DIDSession.authorize(authMethod, {
        resources: ['ceramic://*'],
      })
      ceramic.did = session.did
    }

    console.log('Connected to the ceramic node!')
  } catch (e) {
    console.error((e as Error).message)
    return
  }

  //1 Create My Composite
  let myComposite: Composite
  try {
    console.log('Creating the composite...')
    myComposite = await Composite.create({
      ceramic: ceramic as unknown as CeramicApi,
      schema: graphql,
      index: false,
    })
    console.log(`Creating the composite... Done! The encoded representation:`)
    console.log(myComposite)
  } catch (e) {
    console.error((e as Error).message)
    return
  }

  //2 Deploy My Composite
  if (myCeramicNodeAdminPrivateKey && index)
    try {
      console.log('Deploying the composite...')
      // Notify the Ceramic node to index the models present in the composite
      await myComposite.startIndexingOn(ceramic as unknown as CeramicApi)
      // Logging the model stream IDs to stdout, so that they can be piped using standard I/O or redirected to a file
      console.log(
        JSON.stringify(Object.keys(myComposite.toParams().definition.models))
      )
      console.log(`Deploying the composite... Done!`)
    } catch (e) {
      console.error((e as Error).message)
      return
    }

  //3 Compile My Composite
  let myRuntimeDefinition: RuntimeCompositeDefinition
  try {
    console.log('Compiling the composite...')
    myRuntimeDefinition = myComposite.toRuntime()
    console.log(JSON.stringify(myRuntimeDefinition))
    console.log(`Compiling the composite... Done!`)
  } catch (e) {
    console.error((e as Error).message)
    return
  }

  return { composite: myComposite, runtimeDefinition: myRuntimeDefinition }
}


export async function getRuntimeDefinitionFromEncodedComposite(
  encodedDefinition: string,
  myCeramicNode: string = '',
) {
  if (!encodedDefinition) {
    return null
  }
  try {
    const ceramic = new CeramicClient(myCeramicNode)
    const composite = await Composite.fromJSON(
      {
        definition: JSON.parse(JSON.stringify(encodedDefinition)),
        ceramic,
      })
    // console.log('encoded definition: ', encodedDefinition)
    // console.log('composite: ', composite)
    // console.log('runtime definition:', composite.toRuntime())
    return composite.toRuntime()
  } catch (error) {
    console.error('get runtime error', error)
    return null
  }
}