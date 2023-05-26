import { CeramicApi } from "@ceramicnetwork/common";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { Composite } from "@composedb/devtools";
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays/from-string'

import { CERAMIC_NODE, CERAMIC_NODE_ADMIN_PRIVATE_KEY } from "../../constants";

import { DIDSession } from 'did-session'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'

export async function submitComposeDBModel(graphql: string, myCeramicNode: string = '') {
    console.log('graphql string: ', graphql)

    // 0 Login
    console.log('Connecting to the our ceramic node...')
    const ceramic = new CeramicClient(
        myCeramicNode !== '' ? myCeramicNode : CERAMIC_NODE
    );
    try {
        // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
        // Replace the example key here by your admin private key
        if (CERAMIC_NODE_ADMIN_PRIVATE_KEY && myCeramicNode===CERAMIC_NODE) {
            const privateKey = fromString(CERAMIC_NODE_ADMIN_PRIVATE_KEY, 'base16')
            const did = new DID({
                resolver: getResolver(),
                provider: new Ed25519Provider(privateKey)
            })
            await did.authenticate()
            // An authenticated DID with admin access must be set on the Ceramic instance
            ceramic.did = did
        } else {
            const ethProvider = (window as any).ethereum
            const addresses = await ethProvider.enable()
            const accountId = await getAccountId(ethProvider, addresses[0])
            const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)
            const session = await DIDSession.authorize(authMethod, { resources: ["ceramic://*"] })

            // Uses DIDs in ceramic, composedb & glaze libraries, ie
            ceramic.did = session.did
        }

        console.log('Connected to the our ceramic node!')
    } catch (e) {
        console.error((e as Error).message)
        return
    }
    
    //1 Create My Composite
    let myComposite
    try {
        console.log('Creating the composite...')
        myComposite = await Composite.create({ ceramic: ceramic as unknown as CeramicApi, schema: graphql, index: false})
        console.log(`Creating the composite... Done! The encoded representation:`)
        console.log(myComposite)
    } catch (e) {
        console.error((e as Error))
        return
    }

    //2 Deploy My Composite
    try {
        console.log('Deploying the composite...')
        // Notify the Ceramic node to index the models present in the composite
        await myComposite.startIndexingOn(ceramic as unknown as CeramicApi)
        // Logging the model stream IDs to stdout, so that they can be piped using standard I/O or redirected to a file
        console.log(JSON.stringify(Object.keys(myComposite.toParams().definition.models)))
        console.log(`Deploying the composite... Done!`)
    } catch (e) {
        console.error((e as Error).message)
        return
    }

    //3 Compile My Composite
    let myRuntimeDefinition
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
