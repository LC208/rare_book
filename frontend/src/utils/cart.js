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
 * Добавляем книгу в корзину с учетом количества
 * @param {Object} book Объект книги {id, title, price, quantity}
 * @param {number} quantity Количество для добавления
 */
/**
 * Добавляем книгу в корзину с учетом количества и доступного количества
 * @param {Object} book Объект книги {id, title, price, quantity, book_quantity}
 * @param {number} quantity Количество для добавления
 */
export const addToCart = (book, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === book.id);

  // Максимальное количество для добавления
  const maxQty = book.quantity;

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > maxQty) {
      message.error(`Доступно только ${maxQty} шт. "${book.title}"`);
      return;
    }
    existingItem.quantity = newQuantity;
    existingItem.book_quantity = maxQty; // добавляем book_quantity
    message.success(`Количество "${book.title}" в корзине обновлено до ${existingItem.quantity}`);
  } else {
    if (quantity > maxQty) {
      message.error(`Доступно только ${maxQty} шт. "${book.title}"`);
      return;
    }
    cart.push({
      id: book.id,
      title: book.title,
      price: book.price,
      quantity,
      book_quantity: maxQty, // добавляем доступное количество
    });
    message.success(`"${book.title}" добавлена в корзину (${quantity} шт.)`);
  }

  saveCart(cart);
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
 * Получаем общую стоимость корзины с учетом количества
 * @returns {number}
 */
export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};
