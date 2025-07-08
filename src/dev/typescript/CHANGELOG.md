# @map-of-science/typescript

## 0.3.0

### Minor Changes

- ea93f60: Drop the following tsconfig settings: `allowJs`, `checkJs`, `allowSyntheticDefaultImports`.
  They're not required anymore, as the codebase is now fully TypeScript.
- ea93f60: Drop the following tsconfig lint rules: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
  They are checked by ESLint anyway.

### Patch Changes

- e284bfb: tsconfig include paths cleanup

## 0.2.1

### Patch Changes

- d41e81b: Remove the `vite-plugin` path from the `tsconfig.node.json` file.

## 0.2.0

### Minor Changes

- 74fd765: Turn `typescript` into a peer dependency and drop the `typescript-plugin-css-modules` plugin, since it has to be installed by the package that uses this shared config; otherwise, it will not work.

## 0.1.0

### Minor Changes

- e86d99f: Extract the TypeScript configs into a separate `@map-of-science/typescript` package.
