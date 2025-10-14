import React, { useState, useEffect } from "react";
import { Card, Button, Spin, Table, Typography, Modal } from "antd";
import axios from "../utils/axios";
import { useAuth } from "../hooks/useAuth";

const { Title } = Typography;

const Profile = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [auctions, setAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Получение профиля
  useEffect(() => {
    axios.get("users/profile/")
      .then(res => setUser(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingUser(false));
  }, []);

  // Получение истории заказов
  useEffect(() => {
    axios.get("orders/history/")
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingOrders(false));
  }, []);

  // Получение истории аукционов
  useEffect(() => {
    axios.get("auctions/history/")
      .then(res => setAuctions(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingAuctions(false));
  }, []);

  // Открытие модалки заказа/аукциона
  const openRecordModal = (record) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };
  const closeRecordModal = () => {
    setSelectedRecord(null);
    setIsRecordModalOpen(false);
  };

  // Открытие модалки книги
  const openBookModal = (bookId) => {
    setLoadingBook(true);
    axios.get(`books/?id=${bookId}`)
      .then(res => {
        if (res.data.length > 0) {
          setSelectedBook(res.data[0]);
          setIsBookModalOpen(true);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingBook(false));
  };
  const closeBookModal = () => {
    setSelectedBook(null);
    setIsBookModalOpen(false);
  };

  // Таблица товаров заказа внутри модалки
  const renderDetailsTable = (items) => {
    const columns = [
      { title: "Название книги", dataIndex: "book_title", key: "name" },
      { title: "Цена", dataIndex: "price", key: "price", align: "right" },
    ];

    return (
      <Table
        rowKey="id"
        tableLayout="auto"
        dataSource={items}
        columns={columns}
        pagination={false}
        onRow={(record) => ({
          onClick: () => openBookModal(record.book),
        })}
      />
    );
  };

  // Таблица заказов / аукционов
  const renderTable = (data, type) => {
    const columns = [
      { title: "#", dataIndex: "id", key: "id" },
      { title: "Дата", dataIndex: "date", key: "date" },
      { title: "Статус", dataIndex: "status_display", key: "status_display" },
      { title: "Способ оплаты", dataIndex: "payment_display", key: "payment_display" },
      { title: "Сумма", dataIndex: type === "order" ? "amount" : "bid", align: "right" },
      {
        title: "Действия",
        key: "action",
        render: (_, record) => (
          <Button type="link" onClick={() => openRecordModal(record)}>Подробнее</Button>
        ),
      },
    ];

    return <Table rowKey="id" tableLayout="auto" dataSource={data} columns={columns} loading={type==="order"?loadingOrders:loadingAuctions} />;
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <Card title={<Title level={3}>Профиль</Title>} variant="outlined" style={{ marginBottom: 24 }}>
        {loadingUser ? <Spin /> : (
          <>
            <p><strong>Имя:</strong> {user.first_name}</p>
            <p><strong>Фамилия:</strong> {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" style={{ marginRight: 8 }}>Редактировать профиль</Button>
              <Button danger onClick={logout}>Выйти</Button>
            </div>
          </>
        )}
      </Card>

      <Card title="История заказов" variant="outlined" style={{ marginBottom: 24 }}>
        {renderTable(orders, "order")}
      </Card>

      <Card title="История аукционов" variant="outlined">
        {renderTable(auctions, "auction")}
      </Card>

      {/* Модалка деталей заказа/аукциона */}
      <Modal
        title="Детали"
        open={isRecordModalOpen}
        onCancel={closeRecordModal}
        footer={[
          <Button key="close" onClick={closeRecordModal}>
            Закрыть
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord?.items ? renderDetailsTable(selectedRecord.items) : <p>Нет данных</p>}
      </Modal>

      {/* Модалка книги */}
      <Modal
        title={selectedBook?.title || "Загрузка..."}
        open={isBookModalOpen}
        onCancel={closeBookModal}
        footer={[
          <Button key="close" onClick={closeBookModal}>
            Закрыть
          </Button>,
        ]}
        width={700}
      >
        {loadingBook ? (
          <Spin />
        ) : selectedBook ? (
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: "0 0 200px" }}>
              {selectedBook.photo ? (
                <img src={selectedBook.photo} alt={selectedBook.title} style={{ width: "100%", borderRadius: 8 }} />
              ) : (
                <div style={{
                  width: "100%",
                  height: 250,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                }}>
                  Нет изображения
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p><strong>Авторы:</strong> {selectedBook.authors?.map(a => a.name).join(", ") || "Неизвестно"}</p>
              <p><strong>Жанры:</strong> {selectedBook.genres?.map(g => g.name).join(", ") || "—"}</p>
              <p><strong>Издательство:</strong> {selectedBook.publisher?.name || "—"}</p>
              <p><strong>Год:</strong> {selectedBook.year}</p>
              <p><strong>Состояние:</strong> {selectedBook.condition_display || "—"}</p>
              <p><strong>Статус:</strong> {selectedBook.status_display || "—"}</p>
              <p><strong>Цена:</strong> {selectedBook.price} ₽</p>
              <p style={{ marginTop: 16 }}>
                <strong>Описание:</strong><br />
                {selectedBook.description || "Описание отсутствует"}
              </p>
            </div>
          </div>
        ) : (
          <p>Данные книги не найдены</p>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
