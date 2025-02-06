import { describe, it, expect } from 'vitest';
import { run } from './run';

/**
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

describe('cart transform function', () => {
  it('returns no operations for an empty cart', () => {
    const result = run({});
    const expected = /** @type {FunctionRunResult} */ ({ operations: [] });

    expect(result).toEqual(expected);
  });

  it('calculates total weight and updates cart lines correctly', () => {
    const testInput = {
      cart: {
        lines: [
          {
            id: "gid://shopify/CartLine/45dcab52-556b-4735-b38c-6f22ca20b162",
            quantity: 1,
            cost: {
              amountPerQuantity: {
                amount: "8.0",
                currencyCode: "USD"
              }
            },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/45133214122135",
              weight: 0,
              weightUnit: "POUNDS",
              product: {
                id: "gid://shopify/Product/8795335524503",
                title: "Ice and Cooler"
              }
            }
          },
          {
            id: "gid://shopify/CartLine/8efd0eb0-607c-4ffc-bdd9-da3c8f265397",
            quantity: 5000,
            cost: {
              amountPerQuantity: {
                amount: "145.0",
                currencyCode: "USD"
              }
            },
            merchandise: {
              __typename: "ProductVariant",
              id: "gid://shopify/ProductVariant/43170589016215",
              weight: 2,
              weightUnit: "POUNDS",
              product: {
                id: "gid://shopify/Product/8026830569623",
                title: "Amnesia Drop Earring"
              }
            }
          }
        ]
      }
    };

    const result = run(testInput);
    console.log("Debug Output:", JSON.stringify(result, null, 2));

    expect(result).toHaveProperty("operations");
    expect(Array.isArray(result.operations)).toBe(true);
    expect(result.operations.length).toBeGreaterThan(0);
  });
});
