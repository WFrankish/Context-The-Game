# Context-The-Game
Context makes a game because we're stuck in doors on holiday

## requirements
1. node
2. typescript 3.8.3 or later
3. `npm install @types/node`

## to build
1. tsc --watch

## to run
1. node server.js

# typescript settings
* module: es2015 - use ecmascript modules
* target: esnext - do not attempt to compile to code compatible with older browsers
* sourceMap: true - allow debugging with original code
* strict: true - enforce EVERYTHING (except the below)
* baseUrl, paths - gumf for including typings files
* outdir - output directory
* include - input directory