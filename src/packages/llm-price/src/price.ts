import { calcPrice } from "@pydantic/genai-prices";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
};

// Models not supported by @pydantic/genai-prices (price per 1M tokens)
const customPricing: Record<string, { input: number }> = {
  "voyage-3-large": { input: 0.18 },
  "voyage-3.5": { input: 0.06 },
  "voyage-3.5-lite": { input: 0.02 },
  "voyage-3-lite": { input: 0.02 },
};

export const calculatePrice = (params: {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}) => {
  const custom = customPricing[params.model];
  if (custom) {
    const inputTokens = params.inputTokens ?? 0;
    const price = (inputTokens / 1_000_000) * custom.input;
    return {
      raw: price,
      formatted: formatCurrency(price),
    };
  }

  const pricing = calcPrice(
    {
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
    },
    params.model,
  );

  if (!pricing) {
    return {
      raw: 0,
      formatted: formatCurrency(0),
    };
  }

  return {
    raw: pricing.total_price,
    formatted: formatCurrency(pricing.total_price),
  };
};
