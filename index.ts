import * as Kilt from "@kiltprotocol/sdk-js";
import { config as envConfig } from "dotenv";

export function generateAccount(mnemonic: string): Kilt.KiltKeyringPair {
  const keyring = new Kilt.Utils.Keyring({
    ss58Format: 38,
    type: "sr25519",
  });

  return keyring.addFromMnemonic(mnemonic) as Kilt.KiltKeyringPair;
}

export function generateKeypairs(mnemonic: string): Kilt.KiltKeyringPair {
  const authentication = Kilt.Utils.Crypto.makeKeypairFromUri(
    mnemonic,
    "sr25519"
  );

  return authentication;
}

export async function fetchDid(mnemonic: string) {
  const authentication = generateKeypairs(mnemonic);
  const fullDid = await Kilt.Did.resolve(`did:kilt:${authentication.address}`);

  return { document: fullDid?.document, web3name: fullDid?.web3Name };
}

export async function deleteDid(didUri: Kilt.DidUri, mnemonic: string) {
  const api = Kilt.ConfigService.get("api");
  const authentication = generateKeypairs(mnemonic);
  const account = generateAccount(mnemonic);
  const didIdentifier = Kilt.Did.toChain(didUri);
  const endpointsCountForDid = await api.query.did.didEndpointsCount(
    didIdentifier
  );
  const didDeletionExtrinsic = api.tx.did.delete(endpointsCountForDid);

  const didSignedDeletionExtrinsic = await Kilt.Did.authorizeTx(
    didUri,
    didDeletionExtrinsic,
    async ({ data }) => ({
      signature: authentication.sign(data),
      keyType: authentication.type,
    }),
    account.address
  );

  await Kilt.Blockchain.signAndSubmitTx(didSignedDeletionExtrinsic, account);
}

async function main() {
  envConfig();
  const mnemonic = process.env.MNEMONIC;
  await Kilt.connect("wss://spiritnet.kilt.io");
  const { document, web3name } = await fetchDid(mnemonic!);

  console.log({ document, web3name });

  if (!document?.uri) {
    throw new Error("Nope");
  }

  // await deleteDid(document.uri, mnemonic!)
}

main();
