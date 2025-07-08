export const config = {
  devTool: import.meta.env.VITE_DEV_TOOL_ENABLED === "true",
  namespace: "10b3c450-44d5-42f0-9fda-31000717d0fb",
  LANG: "pl-PL", // TODO: Make it dynamic based on the user language preference
} as const;
