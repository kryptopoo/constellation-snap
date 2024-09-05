# Constellation Snap

Constellation Snap enables users to leverage their MetaMask wallets to interact with Constellation Network with following functionalities:
- Control Constellation accounts that deal with both Constellation addresses and EVM addresses via Metamask wallet
- View balance of DAG and Metagraph tokens
- Send/Receive DAG and Metagraph tokens


<img src="https://i.imgur.com/SYFn5Eh.png" width="800px" >


## Metamask Snap

- MetaMask Snaps is a system that allows anyone to safely expand the capabilities
of MetaMask. A _snap_ is a program that we run in an isolated environment that
can customize the wallet experience.

- Snaps is pre-release software. To interact with (your) Snaps, you will need to install [MetaMask Flask](https://metamask.io/flask/),
a canary distribution for developers that provides access to upcoming features.

## Getting Started

### Setup the development environment

```shell
yarn install && yarn start
```

### Testing and Linting

Run `yarn test` to run the tests once.

Run `yarn lint` to run the linter, or run `yarn lint:fix` to run the linter and
fix any automatically fixable issues.

### Using NPM packages with scripts

Scripts are disabled by default for security reasons. If you need to use NPM
packages with scripts, you can run `yarn allow-scripts auto`, and enable the
script in the `lavamoat.allowScripts` section of `package.json`.

See the documentation for [@lavamoat/allow-scripts](https://github.com/LavaMoat/LavaMoat/tree/main/packages/allow-scripts)
for more information.


## What's next

- Optimize UI/UX and support dark/light theme
- Support adding custom Metagraph tokens
- Support backup account process
- Support multiple accounts