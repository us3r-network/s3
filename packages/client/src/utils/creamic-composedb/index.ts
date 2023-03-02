import { CeramicApi } from "@ceramicnetwork/common";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { Composite } from "@composedb/devtools";
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'
import { fromString } from 'uint8arrays/from-string'

import { CERAMIC_PROXY, CERAMIC_NODE } from "../../constants";


const CERAMIC_PRIVATE_KEY = '44802ccefe230fe220ce995519c15b654f9c3aa07d365d65f85b878d5a6d5a32'

export async function submitComposeDBModel(graphql: string) {
    console.log('graphql string: ', graphql)

    // 0 Login
    console.log('Connecting to the our ceramic node...')
    const ceramic = new CeramicClient(
        CERAMIC_PROXY || CERAMIC_NODE
    );
    try {
        // Hexadecimal-encoded private key for a DID having admin access to the target Ceramic node
        // Replace the example key here by your admin private key
        const privateKey = fromString(CERAMIC_PRIVATE_KEY, 'base16')

        const did = new DID({
            resolver: getResolver(),
            provider: new Ed25519Provider(privateKey),
        })
        await did.authenticate()

        // An authenticated DID with admin access must be set on the Ceramic instance
        ceramic.did = did
        console.log('Connected to the our ceramic node!')
    } catch (e) {
        console.error((e as Error).message)
        return
    }

    //1 Create My Composite
    let myComposite
    try {
        console.log('Creating the composite...')
        myComposite = await Composite.create({ ceramic: ceramic as unknown as CeramicApi, schema: graphql })
        console.log(`Creating the composite... Done! The encoded representation:`)
        console.log(myComposite)
    } catch (e) {
        console.error((e as Error).message)
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
