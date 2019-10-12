# Peer Dependency Enforcer

## Installation

```
npm install --save-dev @jensbodal/peer-dependency-enforcer
yarn add -ED  @jensbodal/peer-dependency-enforcer
```

## Usage

### For library authors

Soon...

Eventually the util will be able to scan your runtime dependencies and warn you if you are not declaring the runtime dependency as a
`dependency` or `peerDependency`.

### For library consumers

If you are not creating a package to be consumed by others, then you'll want to ensure that you are satisfying your 1st party package peer
dependencies.

```
// in your package.json
"scripts": {
    "postinstall": "peer-dependency-enforcer --validatePeerDeps"
},
```
