
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js"
import {AnchorProvider, web3} from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { createKeypairFromFile } from './utils'
import {useAdmin, useListingRequest, useListingQuery, useManageAdmin} from 'grape-art-listing-request'
import BN from "bn.js";



const CONFIG = 'C5gXSr6h5TSKtYCP49WD7jrvQ3kufosRyQNcQa7NxQg2'
// New admin pubkey is D5hrpHhpp7TAxxzkrm41Jjx463cPaLZV8REze45pKFk7
const main = async () => {
    const args = process.argv.slice(2);
    //const connection = new Connection("http://127.0.0.1:8899")
    const connection = new Connection("https://api.devnet.solana.com")
    const admin = './keys/admin.json'
    const user = './keys/user.json'

    const isAdmin = ['init','approve','deny', 'update_fee', 'new_admin'].includes(args[0])
    const keypair = await createKeypairFromFile(isAdmin ? admin : user)
    const wallet = new NodeWallet(keypair)
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())

    switch (args[0]) {
        case "init":
            const { createConfig } = useManageAdmin(provider);
            const [tx, account] = await createConfig(new BN(LAMPORTS_PER_SOL))
            console.log("just created this", account)
            console.log("copy the address to the 'CONFIG' variable if you want to use this config.")
            break;
        case "new_admin":
            const { updateAdmin } = useManageAdmin(provider);
            console.log("update admin", await updateAdmin(new PublicKey(args[1]), new PublicKey(CONFIG)))
            console.log("change the 'admin' variable to", args[1])
            break;
        case "update_fee":
            const { updateFee } = useManageAdmin(provider)
            console.log(`update fee to ${args[1]} lamports`, await updateFee(new BN(parseInt(args[1])), new PublicKey(CONFIG)))
            break;
        case "request":
            const verifiedCollectionAddress = web3.Keypair.generate().publicKey;
            const updateAuthority = web3.Keypair.generate().publicKey;
            const { requestListng } = useListingRequest(provider, new PublicKey(CONFIG))
            const result = await requestListng({
                name: "Loquacious Ladybugs",
                auction_house: web3.Keypair.generate().publicKey,
                verified_collection_address: verifiedCollectionAddress!,
                governance: web3.Keypair.generate().publicKey,
                collection_update_authority: updateAuthority,
                meta_data_url: 'http://whatever.org',
                vanity_url: 'vanity stuff',
                token_type: "testtype"
            })
            console.log("It worked!", "Verified Colleciton Address = ", verifiedCollectionAddress.toBase58(), "Update Authority = ", updateAuthority.toBase58())
            break;
        case "approve":
            const {approveListing} = useAdmin(provider, new PublicKey(CONFIG))
            const approve_result = await approveListing(new PublicKey(args[1]));
            console.log('successfully approved!', approve_result)
            break;
        case "deny":
            const {denyListing} = useAdmin(provider, new PublicKey(CONFIG))
            const deny_result = await denyListing(new PublicKey(args[1]));
            console.log('successfully denied!', deny_result)
            break;
        case "list_pending":
            const {getAllPendingListings} = useListingQuery(provider, new PublicKey(CONFIG))
            const pending_listings = await getAllPendingListings();
            console.log('denied')

            for (let list of pending_listings) {
                console.log('verified collection address', list.verified_collection_address!.toBase58(), "update authority", list.collection_update_authority.toBase58())
            }
            break;
        case "list_approved":
            const {getAllApprovedListings} = useListingQuery(provider, new PublicKey(CONFIG))
            const listings = await getAllApprovedListings();
            console.log('approved')

            for (let list of listings) {
                console.log('verified collection address', list.verified_collection_address!.toBase58(), "update authority", list.collection_update_authority.toBase58())
            }
            break;
        case "is_approved":
            const {isApproved} = useListingQuery(provider, new PublicKey(CONFIG))

            console.log(await isApproved(new PublicKey(args[1])))
            break;
        case "has_token":
            const {hasToken} = useListingQuery(provider, new PublicKey(CONFIG))
            console.log('has token', await hasToken(new PublicKey(args[1])))
            break;
        case "refund":
            const { requestListingRefund } = useListingRequest(provider, new PublicKey(CONFIG))
            console.log('refund requested', await requestListingRefund(new PublicKey(args[1])))
            break;
    }
}

main()