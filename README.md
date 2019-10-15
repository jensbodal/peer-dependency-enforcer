# Peer Dependency Enforcer

## Installation

[peer-dependency-enforcer on npmjs.com](https://www.npmjs.com/package/@jensbodal/peer-dependency-enforcer)

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

See `listRuntimeDependencies` or `validateInstalledDeps` (TODO)

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

## Defaults

### By default, the following directories are ignored:

```
.git
build           // add back with --with-build
node_modules
```

Additional directories can be ignored via `--ignore-dir`

### By default, the following extensions are included for parsing:

```
.ts
.tsx
.js
.jsx
```

This list can be appended to with `--include-extension`

The list can be replaced entirely with `--extension`

### By default, the following module prefixes are ignored:

```
.
@/
/
src
```

This list can be appended to with `--ignore-module-prefix`

This list can be replaced entirely with `--module-prefix`

### By default, all built in modules (e.g. 'fs' or 'path') are ignored

This can be overridden via `--with-built-in`

## TODO

This should probably be maintained elsewhere but leaving here for now:

* Provide alternative logic for dependencies declared in test files
* Possibly print version information with output
* Possibly print file information with output
* Add test coverage report
* Add more tests :)
* Instead of filtering out all @types, return only those that don't have a matching package
    - `@types/foo` with installed package `foo` is good
    - `@types/bar` without any installed package `bar` is probably bad
* Allow configuration of test vs runtime files. Still good to know what dependencies are used, however any dependencies
    used in test code or test setup should not be considered runtime code that needs to have its 3rd party dependencies
    in peerDependencies.
