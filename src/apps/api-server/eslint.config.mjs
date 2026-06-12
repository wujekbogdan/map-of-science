import { defineNodeConfig } from "@map-of-science/eslint";

export default defineNodeConfig({
  rules: {
    // The rule guards libraries against importing code that an npm consumer
    // would not receive. A deployable app has no such consumer: it runs its
    // own bundle. The rule activates only because the package is not private,
    // which it needs to be for changesets to tag its releases.
    "n/no-unpublished-import": "off",
  },
});
