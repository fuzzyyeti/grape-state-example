
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js"
import {AnchorProvider, web3} from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { createKeypairFromFile } from './utils'
import {useAdmin, useListingRequest, useListingQuery, useManageAdmin} from 'grape-art-listing-request'
import BN from "bn.js";


const CONFIG = 'GjBP4p7p8GNbekJgWLzhowUNXRuAHb2TSiCP8d4G7dvY'
//const CONFIG = 'BF9E6X6JCvXNETMZQeaUV1V7EGZ377pmW5S95N4pmpQg'
// New admin pubkey is D5hrpHhpp7TAxxzkrm41Jjx463cPaLZV8REze45pKFk7
const main = async () => {
    const args = process.argv.slice(2);
    //const connection = new Connection("http://127.0.0.1:8899")
    const connection = new Connection("https://api.devnet.solana.com")
    const admin = './keys/admin.json'
    const user = './keys/user.json'

    const isAdmin = ['init','approve','disable','deny', 'update_fee', 'new_admin'].includes(args[0])
    const keypair = await createKeypairFromFile(isAdmin ? admin : user)
    const wallet = new NodeWallet(keypair)
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())

    switch (args[0]) {
        case "init":
            const { createConfig } = useManageAdmin(provider);
            const [tx, account] = await createConfig!(new BN(LAMPORTS_PER_SOL) * .05)
            console.log("just created this", account)
            console.log("copy the address to the 'CONFIG' variable if you want to use this config.")
            break;
        case "new_admin":
            const { updateAdmin } = useManageAdmin(provider);
            console.log("update admin", await updateAdmin!(new PublicKey(args[1]), new PublicKey(CONFIG)))
            console.log("change the 'admin' variable to", args[1])
            break;
        case "update_fee":
            const { updateFee } = useManageAdmin(provider)
            console.log(`update fee to ${args[1]} lamports`, await updateFee!(new BN(parseInt(args[1])), new PublicKey(CONFIG)))
            break;
        case "request":
            const verifiedCollectionAddress = web3.Keypair.generate().publicKey;
            const updateAuthority = web3.Keypair.generate().publicKey;
            const { requestListing } = useListingRequest(provider, new PublicKey(CONFIG))
            const result = await requestListing!({
                name: "Loquacious Ladybugs",
                auction_house: web3.Keypair.generate().publicKey,
                enabled: true,
                verified_collection_address: verifiedCollectionAddress!,
                governance: web3.Keypair.generate().publicKey,
                collection_update_authority: updateAuthority,
                meta_data_url: 'http://whatever.org',
                vanity_url: 'vanity stuff',
                token_type: "testtype",
                listing_requester: provider.wallet.publicKey,
								request_type: 1,
            })
            console.log("It worked!", "Verified Colleciton Address = ", verifiedCollectionAddress.toBase58(), "Update Authority = ", updateAuthority.toBase58())
            break;
        case "approve":
            const {approveListing} = useAdmin(provider, new PublicKey(CONFIG))
            const approve_result = await approveListing!(new PublicKey(args[1]));
            console.log('successfully approved!', approve_result)
            break;
        case "deny":
            const {denyListing} = useAdmin(provider, new PublicKey(CONFIG))
            const deny_result = await denyListing!(new PublicKey(args[1]));
            console.log('successfully denied!', deny_result)
            break;
        case "disable":
            const {setEnableListing} = useAdmin(provider, new PublicKey(CONFIG))
            const disable_result = await setEnableListing!(new PublicKey(args[1]), false);
            console.log('successfully disabled!', disable_result)
            break;

        case "list_pending":
            const {getAllPendingListings} = useListingQuery(provider, new PublicKey(CONFIG))
            const pending_listings = await getAllPendingListings!();
            console.log('denied')

            for (let list of pending_listings) {
                console.log('verified collection address', list.verified_collection_address!.toBase58(),
                    "update authority", list.collection_update_authority.toBase58(),
                    "enabled", list.enabled, "requester", list.listing_requester.toBase58(),
                    "metadata", list.meta_data_url)
            }
            break;
        case "list_pending_requestor":
            const {getAllPendingListingsByRequestor} = useListingQuery(provider, new PublicKey(CONFIG))
            const pending_listings_by_requestor = await getAllPendingListingsByRequestor!();
            console.log('denied')

            for (let list of pending_listings_by_requestor) {
                console.log('verified collection address', list.verified_collection_address!.toBase58(),
                  "update authority", list.collection_update_authority.toBase58(),
                  "enabled", list.enabled)
            }
            break;
        case "list_approved":
            const {getAllApprovedListings} = useListingQuery(provider, new PublicKey(CONFIG))
            const listings = await getAllApprovedListings!();
            console.log('approved')

            for (let list of listings) {
                console.log('verified collection address', list.verified_collection_address!.toBase58(),
                    "update authority", list.collection_update_authority.toBase58(),
                    "enabled", list.enabled)
            }
            break;
        case "is_approved":
            const {isApproved} = useListingQuery(provider, new PublicKey(CONFIG))

            console.log(await isApproved!(new PublicKey(args[1])))
            break;
        case "has_token":
            const {hasToken} = useListingQuery(provider, new PublicKey(CONFIG))
            console.log('has token', await hasToken!(new PublicKey(args[1])))
            break;
        case "refund":
            const { requestListingRefund } = useListingRequest(provider, new PublicKey(CONFIG))
            console.log('refund requested', await requestListingRefund!(new PublicKey(args[1])))
            break;
        case "is_admin":
            const {isAdmin} = useAdmin(provider, new PublicKey(CONFIG))
            console.log(`Is admin = ${await isAdmin!(new PublicKey(args[1]))}`)
        case "update_metadata":
            const {updateMetadataUrl} = useListingRequest(provider, new PublicKey(CONFIG))
            console.log(`Update Complete. Tx = ${await updateMetadataUrl!(new PublicKey(args[1]), args[2])}`)
    }
}

main()
