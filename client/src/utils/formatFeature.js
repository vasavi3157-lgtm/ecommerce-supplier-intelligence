// Turns "num__freight_value" into "Freight Value"
export const formatFeature = (name) => {
  return name
    .replace("num__", "")
    .replace("cat__product_category_name_", "Category: ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};