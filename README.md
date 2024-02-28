# Fetch KILT DID info

## Setup

1. Go to `.env` and add your seed into `MNEMONIC`.
2. `yarn install`

## Fetch

1. Run the script with `yarn run ts-node index.ts`

You'll get "Nope" if there's no DID on the account. Try adding `//did//0` at the end of the `MNEMONIC` string in `.env`.

## Remove DID

1. Uncomment `// await deleteDid(document.uri, mnemonic!)` line to remove your DID and release 2 KILT locked.
2. Run the script with `yarn run ts-node index.ts`.

This might not release w3name, even if Fetch will not show it after removing the DID.
