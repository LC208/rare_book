// cart.js
import { message } from "antd";

/**
 * Получаем текущую корзину из sessionStorage
 * @returns {Array} Массив товаров в корзине
 */
export const getCart = () => {
  const cart = sessionStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
};

/**
 * Сохраняем корзину в sessionStorage
 * @param {Array} cart Массив товаров
 */
export const saveCart = (cart) => {
  sessionStorage.setItem("cart", JSON.stringify(cart));
};

/**
 * Добавляем книгу в корзину
 * @param {Object} book Объект книги {id, title, price}
 */
export const addToCart = (book) => {
  const cart = getCart();

  const existingItem = cart.find(item => item.id === book.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: book.id, title: book.title, price: book.price, quantity: 1 });
  }

  saveCart(cart);
  message.success(`"${book.title}" добавлена в корзину`);
};

/**
 * Удаляем книгу из корзины по ID
 * @param {number} bookId 
 */
export const removeFromCart = (bookId) => {
  const cart = getCart().filter(item => item.id !== bookId);
  saveCart(cart);
  message.info("Книга удалена из корзины");
};

/**
 * Очистить всю корзину
 */
export const clearCart = () => {
  saveCart([]);
  message.info("Корзина очищена");
};

/**
 * Получаем количество товаров в корзине
 * @returns {number}
 */
export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Получаем общую стоимость корзины
 * @returns {number}
 */
export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
