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
3. Comment that line back.
4. Use Sporran to get yourself a new DID.

This might not release w3name, even if Fetch will not show it after removing the DID.

## Release w3name

When you remove DID this doesn't automatically "release" w3name, even if https://w3n.id/username says it's free to claim!
To truly release it you should reclaim the deposit for that name. Sounds fair, just not obvious.

1. Uncomment `// await reclaimW3nameDeposit(document.uri, mnemonic!, w3name!);` line.
2. Run the script with `yarn run ts-node index.ts`.
3. Comment that line back.

## Claim w3name

Now you can claim the same name.

1. Uncomment `// await createW3name(document.uri, didMnemonic!,  mnemonic!, w3name!);` line (yes, I'm that lazy to make an interface, KILT have it on their task list).
2. Run the script with `yarn run ts-node index.ts`.
3. Comment that line back.
4. You're magnificent!
