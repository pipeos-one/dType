# dType Packages

Contains core packages for dType and example packages for each type.

Future plans:
- type packages will be published on Swarm/IPFS and loaded on demand in the client app

## Development

```
cd dType
npm install
lerna bootstrap

cd dType/client
npm link dtype-core
npm link dtype-alias
npm link dtype-markdown
```
