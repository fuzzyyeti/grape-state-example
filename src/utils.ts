import {Keypair} from "@solana/web3.js"
import bs58 from "bs58"
import {promises as fs} from "fs"

export async function createKeypairFromFile(
    filePath: string,
): Promise<Keypair> {
    const secretKeyString =  await fs.readFile(filePath, {"encoding": "utf-8"})
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString))
    console.log(bs58.encode(secretKey))
    return Keypair.fromSecretKey(secretKey)
}
