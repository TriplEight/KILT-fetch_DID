import * as Kilt from "@kiltprotocol/sdk-js";
import { config as envConfig } from "dotenv";

export function generateAccount(didMnemonic: string): Kilt.KiltKeyringPair {
  const keyring = new Kilt.Utils.Keyring({
    ss58Format: 38,
    type: "sr25519",
  });

  return keyring.addFromMnemonic(didMnemonic) as Kilt.KiltKeyringPair;
}

export function generateKeypairs(mnemonic: string): Kilt.KiltKeyringPair {
  const authentication = Kilt.Utils.Crypto.makeKeypairFromUri(
    mnemonic,
    "sr25519"
  );

  return authentication;
}

export async function fetchDid(didMnemonic: string) {
  const authentication = generateKeypairs(didMnemonic);
  const fullDid = await Kilt.Did.resolve(`did:kilt:${authentication.address}`);

  return { document: fullDid?.document, web3name: fullDid?.web3Name };
}

export async function deleteDid(didUri: Kilt.DidUri, didMnemonic: string) {
  const api = Kilt.ConfigService.get("api");
  const authentication = generateKeypairs(didMnemonic);
  const account = generateAccount(didMnemonic);
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

export async function reclaimW3nameDeposit(didUri: Kilt.DidUri, mnemonic: string, w3name: string) {
  const api = Kilt.ConfigService.get("api");
  const account = generateAccount(mnemonic);

  const web3NameReleaseTx = api.tx.web3Names.reclaimDeposit(w3name)
  await Kilt.Blockchain.signAndSubmitTx(web3NameReleaseTx, account)
}

export async function createW3name(didUri: Kilt.DidUri, didMnemonic: string, mnemonic: string, w3name: string) {
  const api = Kilt.ConfigService.get("api");
  const authentication = generateKeypairs(mnemonic);
  const account = generateAccount(mnemonic);

  const w3nCreationExtrinsic = api.tx.web3Names.claim(w3name);

  const didSignedW3nCreationExtrinsic = await Kilt.Did.authorizeTx(
    didUri,
    w3nCreationExtrinsic,
    async ({ data }) => ({
      signature: authentication.sign(data),
      keyType: authentication.type,
    }),
    account.address
  );

  await Kilt.Blockchain.signAndSubmitTx(didSignedW3nCreationExtrinsic, account);
}

async function main() {
  envConfig();
  const mnemonic = process.env.MNEMONIC;
  const did = process.env.DID_DERIVATION;
  const didMnemonic = mnemonic! + did!;
  const w3name = process.env.W3NAME;
  await Kilt.connect("wss://spiritnet.kilt.io");
  const { document, web3name } = await fetchDid(didMnemonic!);

  console.log({ document, web3name });

  if (!document?.uri) {
    throw new Error("Nope");
  }

  // await deleteDid(document.uri, mnemonic!)
  // await reclaimW3nameDeposit(document.uri, mnemonic!, w3name!);
  // await createW3name(document.uri, didMnemonic!,  mnemonic!, w3name!);

  process.exit()
}

main();
