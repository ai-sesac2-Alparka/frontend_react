import { quadrakillAdapter } from "./quadrakillAdapter";

const ENGINE = import.meta.env.VITE_ENGINE || "quadrakill";

/**
 * Engine adapter selector.
 * Default: quadrakill (unified backend).
 * Legacy adapters can be added here if needed.
 */
export const getEngineAdapter = () => {
  switch (ENGINE) {
    case "quadrakill":
    default:
      return quadrakillAdapter;
  }
};
