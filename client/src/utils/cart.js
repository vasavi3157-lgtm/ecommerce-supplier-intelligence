// Simple cart stored in the browser's localStorage, keyed per app (not per user yet)

const CART_KEY = "suplio_cart";

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};

export const addToCart = (item) => {
  const cart = getCart();
  const existing = cart.find(
    (c) => c.productId === item.productId && c.supplierId === item.supplierId
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
};

export const removeFromCart = (productId, supplierId) => {
  const cart = getCart().filter(
    (c) => !(c.productId === productId && c.supplierId === supplierId)
  );
  saveCart(cart);
};

export const updateQuantity = (productId, supplierId, quantity) => {
  const cart = getCart().map((c) =>
    c.productId === productId && c.supplierId === supplierId
      ? { ...c, quantity: Math.max(1, quantity) }
      : c
  );
  saveCart(cart);
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartCount = () => {
  return getCart().reduce((sum, c) => sum + c.quantity, 0);
};

export const getCartTotal = () => {
  return getCart().reduce((sum, c) => sum + c.price * c.quantity, 0);
};