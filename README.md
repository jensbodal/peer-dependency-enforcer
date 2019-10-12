# Peer Dependency Enforcer

## Installation

```
npm install --save-dev @jensbodal/peer-dependency-enforcer
yarn add -ED  @jensbodal/peer-dependency-enforcer
```

## Usage

```
./node_modules/.bin/peer-dependency-enforcer --help
```

### General

`yargs` is used to parse command line arguments, therefore boolean flags can be passed like:

```
# --throwUnmet === --throw-unmet

# set to true
peer-dependency-enforcer --throwUnmet
peer-dependency-enforcer --throwUnmet true
peer-dependency-enforcer --throwUnmet=true

# set to false
peer-dependency-enforcer --no-logUnmet
peer-dependency-enforcer --logUnmet false
peer-dependency-enforcer --logUnmet=false
```

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
    "postinstall": "peer-dependency-enforcer validatePeerDeps"
},
```

By default the script will fail and throw an error only if there are missing peer dependencies. Otherwise all missing and unmet
peer dependencies are logged by default.

See `peer-dependency-enforcer --help` for more information
