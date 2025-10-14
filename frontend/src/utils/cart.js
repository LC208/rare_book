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
    message.success(`"${book.title}" уже в корзине`);
  } else {
    cart.push({ id: book.id, title: book.title, price: book.price});
    saveCart(cart);
    message.success(`"${book.title}" добавлена в корзину`);
  }


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
 * Получаем общую стоимость корзины
 * @returns {number}
 */
export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => Number(sum) + Number(item.price), 0);
};
