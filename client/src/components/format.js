const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const money = value => (value == null || Number.isNaN(Number(value)) ? "—" : currency.format(value));
