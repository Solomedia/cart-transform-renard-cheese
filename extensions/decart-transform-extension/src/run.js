// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").CartOperation} CartOperation
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * Convertir las unidades de peso Shopify a libras (lb)
 * @param {number} weight - Peso original
 * @param {string} unit - Unidad de peso ("Oz", "Kg", "g", "lb")
 * @returns {number} - Retorna peso en libras
 */
function convertToPounds(weight, unit) {
  const conversionRates = {
    "OUNCES": 0.0625,
    "KILOGRAMS": 2.20462, 
    "GRAMS": 0.00220462, 
    "POUNDS": 1
  };

  return weight * (conversionRates[unit] || 1); // Si la unidad no está en el objeto, se asume 1:1
}

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  let totalWeight = 0;
  let operations = [];

  const iceCoolerId = "8272060711000";
  const iceCoolerIdID = "gid://shopify/Product/8272060711000";
  
  const giftBoxId = "8272056385624";
  const giftBoxIdID = "gid://shopify/Product/8272056385624";

  // Calcular el peso total del carrito en OZ
  input.cart.lines.forEach(line => {
    const { merchandise } = line;

    // Excluir Ice Cooler y Gift Box del cálculo de peso
    if (merchandise?.product?.id === iceCoolerId || 
      merchandise?.product?.id === iceCoolerIdID || 
      merchandise?.product?.id === giftBoxId || 
      merchandise?.product?.id === giftBoxIdID) {
      return;
    }

    if (merchandise?.weight && merchandise?.weightUnit) {
      const convertedWeight = convertToPounds(merchandise.weight, merchandise.weightUnit);
      totalWeight += convertedWeight * line.quantity;
    }
  });

  input.cart.lines.forEach(line => {
    const operation = optionallyBuildUpdateOperation(line, totalWeight);
    if (operation) {
      operations.push({ update: operation });
    }
  });

  return operations.length > 0 ? { operations } : NO_CHANGES;
}

/**
 * @param {RunInput['cart']['lines'][number]} cartLine
 * @param {number} totalWeight - Peso total del carrito (en libras)
 */
function optionallyBuildUpdateOperation({ id: cartLineId, merchandise }, totalWeight) {
  const iceCoolerId = "8272060711000";
  const iceCoolerIdID = "gid://shopify/Product/8272060711000";
  
  const giftBoxId = "8272056385624";
  const giftBoxIdID = "gid://shopify/Product/8272056385624";

  let newPrice = 0;

  if (merchandise?.product?.id == iceCoolerId || merchandise?.product?.id == iceCoolerIdID) {
    if (totalWeight <= 5) newPrice = 12.00;
    else if (totalWeight > 5 && totalWeight <= 17) newPrice = 18.00;
    else newPrice = 25.00;
  }

  if (merchandise?.product?.id == giftBoxId || merchandise?.product?.id == giftBoxIdID) {
    newPrice = totalWeight < 8 ? 12.00 : 14.00;
  }

  if (newPrice > 0) {
    return {
      cartLineId,
      price: {
        adjustment: {
          fixedPricePerUnit: {
            amount: Number(newPrice.toFixed(2)),
          },
        },
      },
    };
  }

  return null;
}