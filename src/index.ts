
//request 5Ph5jwoHwp24uVrgvUYLPX48Kmugzykfbm3Dhm7YXmzk verified 5hod5XM33BjqFBvKgsYKhzMzbkFHdsqJiF3q9BvqKQHq
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js"
import {AnchorProvider, web3} from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { createKeypairFromFile } from './utils'
import {useAdmin, useListingRequest, useListingQuery, useManageAdmin} from 'grape-art-listing-request'
import BN from "bn.js";


const KEY_FILE = '/Users/fzzyyti/.config/solana/id.json'
const CONFIG = '2xE9MyGe2PsXEyWivES2ESxi7iqm4L5cTAxj6C68eyQT'
// 3pJHarWHeeToQM1g3J9cHkftJU8RWG5UYmG5ZAoHhHseYD5DeAGbCZcLwMmcMVFSkK1wq7xyoxcQFUD3mhz8r3mE
const main = async () => {
    const args = process.argv.slice(2);
    const connection = new Connection("http://127.0.0.1:8899")
    // const connection = new Connection("https://api.devnet.solana.com")
    const keypair = await createKeypairFromFile(KEY_FILE)
    const wallet = new NodeWallet(keypair)
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions())

    switch (args[0]) {
        case "init":
            const {updateAdmin, createConfig} = useManageAdmin(provider);
            const [tx, account] = await createConfig(new BN(LAMPORTS_PER_SOL))
            console.log("just created this", account)
            break;
        case "request":
            const verifiedCollectionAddress = web3.Keypair.generate().publicKey;
            const updateAuthority = web3.Keypair.generate().publicKey;
            const {requestListng} = useListingRequest(provider, new PublicKey(CONFIG))
            const result = await requestListng({
                name: "Loquacious Ladybugs",
                auction_house: web3.Keypair.generate().publicKey,
                // verified_collection_address: verifiedCollectionAddress!,
                governance: web3.Keypair.generate().publicKey,
                collection_update_authority: updateAuthority,
                meta_data_url: 'http://whatever.org',
                vanity_url: 'vanity stuff',
                token_type: "testtype"
            })
            console.log("made a request", result)
            console.log("It worked!", result, verifiedCollectionAddress.toBase58(), updateAuthority.toBase58())
            break;
        case "approve":
            const {approveListing} = useAdmin(provider, new PublicKey(CONFIG))
            const approve_result = await approveListing(new PublicKey(args[1]));
            console.log('successfully approved!', approve_result)
            break;
        case "deny":
            const {denyListing} = useAdmin(provider, new PublicKey(CONFIG))
            const deny_result = await denyListing(new PublicKey(args[1]));
            console.log('successfully approved!', deny_result)
            break;
        case "list_pending":
            const {getAllPendingListings} = useListingQuery(provider, new PublicKey(CONFIG))
            const pending_listings = await getAllPendingListings();
            console.log('denied')

            for (let list of pending_listings) {
                console.log('verified collection address', list.verified_collection_address!.toBase58())
            }
            break;
        case "list_approved":
            const {getAllApprovedListings} = useListingQuery(provider, new PublicKey(CONFIG))
            const listings = await getAllApprovedListings();
            console.log('approved')

            for (let list of listings) {
                console.log('verified collection address', list.verified_collection_address!.toBase58())
            }
            break;
        case "is_approved":
            const {isApproved} = useListingQuery(provider, new PublicKey(CONFIG))

            console.log(await isApproved(new PublicKey(args[1])))
            break;
        case "has_token":
            const {hasToken} = useListingQuery(provider, new PublicKey(CONFIG))
            console.log('has token', await hasToken(new PublicKey("5zL9T9M6MbMCQ4ZfkH7nwptUhPPCiUfegmjZZq8Gg1YF")))

    }
}

main()