import React, { useState, useEffect } from "react";
import { Card, Button, Spin, Drawer, Table, Typography, ConfigProvider } from "antd";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Получение профиля
  useEffect(() => {
    axios.get("users/profile/")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingUser(false));
  }, []);

  // Получение истории заказов
  useEffect(() => {
    axios.get("orders/history/")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingOrders(false));
  }, []);

  // Получение истории аукционов
  useEffect(() => {
    axios.get("auctions/history/")
      .then((res) => setAuctions(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingAuctions(false));
  }, []);

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

  // Таблица для заказов / аукционов
  const renderTable = (data, type) => {
    const columns = [
      { title: "#", dataIndex: "id", key: "id" },
      { title: "Дата", dataIndex: "date", key: "date" },
      { 
        title: "Сумма / Ставка", 
        dataIndex: type === "order" ? "total" : "bid", 
        key: "total" 
      },
      { 
        title: "Действия", 
        key: "action",
        render: (_, record) => (
          <Button type="link" onClick={() => openDetailsModal(record)}>Подробнее</Button>
        )
      }
    ];

    return <Table rowKey="id" dataSource={data} columns={columns} loading={type==="order"?loadingOrders:loadingAuctions} />;
  };

  // Таблица внутри модального окна
  const renderDetailsTable = (items) => {
    const columns = [
      { title: "Название книги", dataIndex: "name", key: "name" },
      { title: "Цена", dataIndex: "price", key: "price" },
      { title: "Количество", dataIndex: "quantity", key: "quantity" }
    ];
    return <Table rowKey="id" dataSource={items} columns={columns} pagination={false} />;
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

        <Drawer
          open={isModalOpen}
          onClose={closeModal}
          width={700}
          title="Детали"
          styles={{
            header: { backgroundColor: "#DE7625", color: "#fff" },
            body: { padding: 16 }
          }}
        >
          {selectedRecord?.items ? renderDetailsTable(selectedRecord.items) : <p>Нет данных</p>}
        </Drawer>
      </div>
  );
};

export default Profile;
