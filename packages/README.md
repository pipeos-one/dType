# dType Packages

Contains core packages for dType and example packages for each type.

Future plans:
- type packages will be published on Swarm/IPFS and loaded on demand in the client app

## Development

Packages need to be linked:

```
cd packages/dtype-core
npm link
cd packages/dtype-alias
npm link

cd client
npm link dtype-core
```
