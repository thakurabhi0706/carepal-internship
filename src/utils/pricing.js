
import pricingConfig from "../data/pricing.json";

// Main pricing calculation function
export function calculateEstimate(plan) {
  const {
    city,
    careType,
    hoursPerDay,
    shift,
    durationDays,
    addons = {}
  } = plan;

  // 1. Validate basic inputs
  if (
    !city ||
    !careType ||
    !hoursPerDay ||
    !shift ||
    !durationDays
  ) {
    throw new Error("Please complete all care plan selections.");
  }

  // 2. Get city configuration
  const cityRates = pricingConfig.cities[city];

  if (!cityRates) {
    throw new Error("Pricing unavailable for selected city.");
  }

  // 3. Get service configuration
  const serviceRates = cityRates[careType];

  if (!serviceRates) {
    throw new Error("Invalid care type selected.");
  }

  // 4. Get shift rate
  const shiftKey = shift === "live-in" ? "liveIn" : shift;

  const baseRate = serviceRates[shiftKey];

  if (typeof baseRate !== "number") {
    throw new Error("Invalid shift selected.");
  }

  // 5. Get hours multiplier
  const hoursMultiplier =
    pricingConfig.hoursMultiplier[String(hoursPerDay)];

  if (typeof hoursMultiplier !== "number") {
    throw new Error("Invalid care hours selected.");
  }

  // 6. Validate duration
  if (
    !Number.isInteger(durationDays) ||
    !pricingConfig.durations.includes(durationDays)
  ) {
    throw new Error("Invalid care duration selected.");
  }

  // 7. Calculate daily and total care cost
  const dailyCareCost = baseRate * hoursMultiplier;

  const careCost = dailyCareCost * durationDays;

  // 8. Calculate add-on costs
  const addonBreakdown = [];

  for (const [addonKey, quantity] of Object.entries(addons)) {
    const addonConfig = pricingConfig.addons[addonKey];

    if (!addonConfig) {
      throw new Error(`Invalid add-on: ${addonKey}`);
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > 100
    ) {
      throw new Error(`Invalid quantity for ${addonConfig.name}`);
    }

    if (quantity === 0) continue;

    const total = addonConfig.price * quantity;

    addonBreakdown.push({
      key: addonKey,
      name: addonConfig.name,
      quantity,
      unit: addonConfig.unit,
      unitPrice: addonConfig.price,
      total
    });
  }

  const addonTotal = addonBreakdown.reduce(
    (sum, addon) => sum + addon.total,
    0
  );

  // 9. Calculate subtotal
  const subtotal = careCost + addonTotal;

  // 10. Calculate GST
  const gstPercentage = pricingConfig.gstPercentage;

  const gstAmount = subtotal * (gstPercentage / 100);

  // 11. Final price
  const total = subtotal + gstAmount;

  // 12. Return complete breakdown
  return {
    currency: pricingConfig.currency,

    inputs: {
      city,
      careType,
      hoursPerDay,
      shift,
      durationDays
    },

    breakdown: {
      baseRate,
      hoursMultiplier,
      dailyCareCost,
      careCost,
      addons: addonBreakdown,
      addonTotal,
      subtotal,
      gstPercentage,
      gstAmount,
      total
    }
  };
}

// Format amounts in Indian currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: pricingConfig.currency,
    maximumFractionDigits: 2
  }).format(amount);
}

// Expose configuration for dropdowns and other UI components
export function getPricingConfig() {
  return pricingConfig;
}
