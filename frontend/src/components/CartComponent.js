// CartComponent.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, InputNumber, Space, Typography, Popconfirm } from "antd";
import { getCart, saveCart, removeFromCart, clearCart } from "../utils/cart";

const { Title } = Typography;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  // Обновляем количество книги
  const handleQuantityChange = (value, record) => {
    const updatedCart = cartItems.map(item =>
      item.id === record.id ? { ...item, quantity: value } : item
    );
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
      dataIndex: "quantity",
      key: "quantity",
      render: (val, record) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(value) => handleQuantityChange(value, record)}
        />
      ),
    },
    {
      title: "Сумма, ₽",
      key: "total",
      render: (_, record) => Number(record.price * record.quantity).toFixed(2),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Удалить книгу из корзины?"
          onConfirm={() => handleRemove(record.id)}
        >
          <Button danger size="small">Удалить</Button>
        </Popconfirm>
      ),
    },
  ];

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <Space style={{ display: "flex", justifyContent: "space-between" }}>
                <Button danger onClick={handleClear}>Очистить корзину</Button>
                <span style={{ fontWeight: 700 }}>Итого: {Number(totalPrice).toFixed(2)} ₽</span>
              </Space>
            )}
          />
        </>
      )}
    </div>
  );
};

export default Cart;
