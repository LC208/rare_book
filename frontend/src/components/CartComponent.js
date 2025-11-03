import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Space, Typography, Popconfirm, message } from "antd";
import { getCart, saveCart, removeFromCart, clearCart } from "../utils/cart";
import axios from "../utils/axios";

const { Title } = Typography;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  // Изменение количества с ограничением по наличию книги
  const handleQuantityChange = (id, newQuantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const maxQty = item.book_quantity || 100;
        const quantity = Math.min(Math.max(newQuantity, 1), maxQty);
        return { ...item, quantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  // Удаляем книгу
  const handleRemove = (id) => {
    removeFromCart(id);
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
  };

  // Очищаем корзину
  const handleClear = () => {
    clearCart();
    setCartItems([]);
  };

  // Оформляем заказ
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      message.warning("Корзина пуста");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("orders/create/", {
        payment: "H", // Оплата при получении
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity || 1,
        })),
      });

      message.success(`Заказ №${response.data.id} успешно оформлен!`);
      handleClear();
    } catch (error) {
      console.error(error);
      if (error.response?.data?.insufficient_books?.length) {
        message.error(
          "Недостаточно экземпляров:\n" +
            error.response.data.insufficient_books.join("\n")
        );
      } else if (error.response?.data?.unavailable_books?.length) {
        message.error(
          "Некоторые книги недоступны:\n" +
            error.response.data.unavailable_books.join("\n")
        );
      } else {
        message.error("Ошибка при оформлении заказа");
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Цена, ₽",
      dataIndex: "price",
      key: "price",
      render: (val) => Number(val).toFixed(2),
    },
    {
      title: "Количество",
      key: "quantity",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.book_quantity || 100}
          value={record.quantity || 1}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: "Сумма, ₽",
      key: "total",
      render: (_, record) =>
        Number(record.price * (record.quantity || 1)).toFixed(2),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Удалить книгу из корзины?"
          onConfirm={() => handleRemove(record.id)}
        >
          <Button danger size="small">
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <Title level={3}>Корзина</Title>
      {cartItems.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <Table
            dataSource={cartItems}
            columns={columns}
            rowKey="id"
            pagination={false}
            footer={() => (
              <Space
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Button danger onClick={handleClear} disabled={loading}>
                  Очистить корзину
                </Button>
                <Space align="center">
                  <strong>Итого: {totalPrice.toFixed(2)} ₽</strong>
                  <Button
                    type="primary"
                    onClick={handleCheckout}
                    loading={loading}
                  >
                    Оформить заказ
                  </Button>
                </Space>
              </Space>
            )}
          />
        </>
      )}
    </div>
  );
};

export default Cart;
