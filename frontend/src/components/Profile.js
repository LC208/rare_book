import React, { useState, useEffect } from "react";
import { Card, Button, Spin, Table, Typography, Modal, Form, Input, Progress, Tag, InputNumber, message, Descriptions } from "antd";
import { ClockCircleOutlined, TrophyOutlined, DollarOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import { useAuth } from "../hooks/useAuth";
import zxcvbn from "zxcvbn";

const { Title, Text } = Typography;

const Profile = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const [selectedAuction, setSelectedAuction] = useState(null);
  const [auctionBids, setAuctionBids] = useState([]);
  const [loadingAuctionBids, setLoadingAuctionBids] = useState(false);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(null);
  const [submittingBid, setSubmittingBid] = useState(false);

  const [selectedBook, setSelectedBook] = useState(null);
  const [loadingBook, setLoadingBook] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordText, setPasswordText] = useState("");
  const [form] = Form.useForm();

  const getPasswordStatus = () => {
    switch (passwordScore) {
      case 0: return { status: "exception", text: "Очень слабый" };
      case 1: return { status: "exception", text: "Слабый" };
      case 2: return { status: "normal", text: "Средний" };
      case 3: return { status: "success", text: "Хороший" };
      case 4: return { status: "success", text: "Сильный" };
      default: return { status: "exception", text: "" };
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordText(value);
    setPasswordScore(zxcvbn(value).score);
  };

  const PASSWORD_BLACKLIST = ["12345678", "password", "qwerty"];

  const validatePassword = (_, value) => {
    if (!value) return Promise.resolve();
    if (value.length < 8) return Promise.reject(new Error("Пароль должен быть не менее 8 символов"));
    if (value.includes(" ")) return Promise.reject(new Error("Пароль не должен содержать пробелы"));
    if (PASSWORD_BLACKLIST.includes(value)) return Promise.reject(new Error("Пароль слишком простой"));
    if (zxcvbn(value).score < 2) return Promise.reject(new Error("Пароль слишком простой, используйте более сложный"));
    return Promise.resolve();
  };

  const validateName = (_, value) => {
    if (!value) return Promise.reject(new Error("Поле обязательно"));
    if (value.length > 50) return Promise.reject(new Error("Слишком длинное имя/фамилия (максимум 50 символов)"));
    if (/[^а-яА-ЯёЁa-zA-Z\-]/.test(value)) return Promise.reject(new Error("Недопустимые символы, только буквы и дефис"));
    return Promise.resolve();
  };

  const passwordStatus = getPasswordStatus();

  const openEditModal = () => {
    const initialValues = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: "",
    };
    setEditForm(initialValues);
    form.setFieldsValue(initialValues);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => setIsEditModalOpen(false);

  const handleSaveProfile = async (values) => {
    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
      };
      if (values.password) payload.password = values.password;

      const res = await axios.put("users/profile/", payload);
      setUser(res.data);
      setIsEditModalOpen(false);
      message.success("Профиль успешно обновлён");
    } catch (err) {
      console.error(err);
      message.error("Ошибка при обновлении профиля");
    }
  };

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

  // Получение истории ставок
  useEffect(() => {
    axios.get("auctions/bids/history/")
      .then(res => setBids(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingBids(false));
  }, []);

  // Открытие модалки заказа
  const openRecordModal = (record) => {
    setSelectedRecord(record);
    setIsRecordModalOpen(true);
  };

  const closeRecordModal = () => {
    setSelectedRecord(null);
    setIsRecordModalOpen(false);
  };

  // Открытие модалки аукциона
  const openAuctionModal = async (bid) => {
    setSelectedAuction(null);
    setAuctionBids([]);
    setBidAmount(null);
    setIsAuctionModalOpen(true);
    setLoadingAuctionBids(true);

    try {
      const [auctionRes, bidsRes] = await Promise.all([
        axios.get(`auctions/${bid.auction}/`),
        axios.get(`auctions/${bid.auction}/bids/`)
      ]);
      
      setSelectedAuction(auctionRes.data);
      setAuctionBids(bidsRes.data);
      
      // Устанавливаем минимальную ставку
      const minBid = Math.max(
        auctionRes.data.starting_price,
        Number(auctionRes.data.current_bid) + Number(auctionRes.data.bid_step)
      );
      setBidAmount(minBid);
    } catch (err) {
      console.error(err);
      message.error("Ошибка загрузки данных аукциона");
    } finally {
      setLoadingAuctionBids(false);
    }
  };

  const closeAuctionModal = () => {
    setSelectedAuction(null);
    setAuctionBids([]);
    setIsAuctionModalOpen(false);
  };

  const handlePlaceBid = async () => {
    if (!bidAmount || !selectedAuction) return;

    setSubmittingBid(true);
    try {
      await axios.post("auctions/bids/", {
        auction: selectedAuction.id,
        amount: bidAmount
      });
      
      message.success("Ставка успешно сделана!");
      
      // Обновляем данные
      const [auctionRes, bidsRes, userBidsRes] = await Promise.all([
        axios.get(`auctions/${selectedAuction.id}/`),
        axios.get(`auctions/${selectedAuction.id}/bids/`),
        axios.get("auctions/bids/history/")
      ]);
      
      setSelectedAuction(auctionRes.data);
      setAuctionBids(bidsRes.data);
      setBids(userBidsRes.data);
      
      // Обновляем минимальную ставку
      const minBid = Math.max(
        auctionRes.data.starting_price,
        Number(auctionRes.data.current_bid) + Number(auctionRes.data.bid_step)
      );
      setBidAmount(minBid);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.non_field_errors?.[0] || "Ошибка при размещении ставки";
      message.error(errorMsg);
    } finally {
      setSubmittingBid(false);
    }
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
          style: { cursor: 'pointer' }
        })}
      />
    );
  };

  // Таблица заказов
  const renderOrdersTable = () => {
    const columns = [
      { title: "#", dataIndex: "id", key: "id", width: 80 },
      { title: "Дата", dataIndex: "date", key: "date" },
      { title: "Статус", dataIndex: "status_display", key: "status_display" },
      { title: "Способ оплаты", dataIndex: "payment_display", key: "payment_display" },
      { title: "Сумма", dataIndex: "amount", key: "amount", align: "right" },
      {
        title: "Действия",
        key: "action",
        render: (_, record) => (
          <Button type="link" onClick={() => openRecordModal(record)}>Подробнее</Button>
        ),
      },
    ];

    return <Table rowKey="id" tableLayout="auto" dataSource={orders} columns={columns} loading={loadingOrders} />;
  };

  // Таблица ставок пользователя
  const renderBidsTable = () => {
    const columns = [
      { 
        title: "#", 
        dataIndex: "id", 
        key: "id", 
        width: 80 
      },
      { 
        title: "Товар", 
        dataIndex: "product_title", 
        key: "product_title",
        render: (text) => <Text strong>{text}</Text>
      },
      { 
        title: "Ставка", 
        dataIndex: "amount", 
        key: "amount", 
        align: "right",
        render: (amount) => <Text style={{ fontSize: 16, color: '#1890ff' }}>{amount} ₽</Text>
      },
      { 
        title: "Дата", 
        dataIndex: "created_at", 
        key: "created_at",
        render: (date) => new Date(date).toLocaleString('ru-RU')
      },
      { 
        title: "Статус аукциона", 
        dataIndex: "auction_status", 
        key: "auction_status",
        render: (status) => {
          const colorMap = {
            "Запланирован": "blue",
            "Активен": "green",
            "Завершён": "default",
            "Отменён": "red"
          };
          return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
        }
      },
      {
        title: "Действия",
        key: "action",
        render: (_, record) => (
          <Button type="link" onClick={() => openAuctionModal(record)}>
            Детали аукциона
          </Button>
        ),
      },
    ];

    return <Table rowKey="id" tableLayout="auto" dataSource={bids} columns={columns} loading={loadingBids} />;
  };

  // Таблица всех ставок в модалке аукциона
  const renderAuctionBidsTable = () => {
    const columns = [
      { 
        title: "Участник", 
        dataIndex: "user_email", 
        key: "user_email",
        render: (email, record) => {
          const isCurrentUser = user && email === user.email;
          return (
            <span>
              {email}
              {isCurrentUser && <Tag color="blue" style={{ marginLeft: 8 }}>Вы</Tag>}
            </span>
          );
        }
      },
      { 
        title: "Ставка", 
        dataIndex: "amount", 
        key: "amount", 
        align: "right",
        render: (amount, record, index) => (
          <Text strong style={{ 
            fontSize: 16, 
            color: index === 0 ? '#52c41a' : '#1890ff' 
          }}>
            {amount} ₽ {index === 0 && <TrophyOutlined style={{ color: '#faad14' }} />}
          </Text>
        )
      },
      { 
        title: "Время", 
        dataIndex: "created_at", 
        key: "created_at",
        render: (date) => new Date(date).toLocaleString('ru-RU')
      },
    ];

    return (
      <Table 
        rowKey="id" 
        tableLayout="auto" 
        dataSource={auctionBids} 
        columns={columns} 
        pagination={false}
        size="small"
      />
    );
  };

  const getAuctionStatusTag = (auction) => {
    const statusMap = {
      "Запланирован": { color: "blue", icon: <ClockCircleOutlined /> },
      "Активен": { color: "green", icon: <DollarOutlined /> },
      "Завершён": { color: "default", icon: null },
      "Отменён": { color: "red", icon: null }
    };
    const config = statusMap[auction.status_display] || { color: "default", icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {auction.status_display}
      </Tag>
    );
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
              <Button type="primary" style={{ marginRight: 8 }} onClick={openEditModal}>
                Редактировать профиль
              </Button>
              <Button danger onClick={logout}>Выйти</Button>
            </div>
          </>
        )}
      </Card>

      <Card title="История заказов" variant="outlined" style={{ marginBottom: 24 }}>
        {renderOrdersTable()}
      </Card>

      <Card title="Мои ставки на аукционах" variant="outlined">
        {renderBidsTable()}
      </Card>

      {/* Модалка деталей заказа */}
      <Modal
        title="Детали заказа"
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

      {/* Модалка аукциона */}
      <Modal
        title="Детали аукциона"
        open={isAuctionModalOpen}
        onCancel={closeAuctionModal}
        footer={null}
        width={900}
      >
        {loadingAuctionBids ? (
          <Spin />
        ) : selectedAuction ? (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Товар" span={2}>
                <Text strong style={{ fontSize: 16 }}>{selectedAuction.product_title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                {getAuctionStatusTag(selectedAuction)}
              </Descriptions.Item>
              <Descriptions.Item label="Текущая ставка">
                <Text style={{ fontSize: 18, color: '#52c41a', fontWeight: 'bold' }}>
                  {selectedAuction.current_bid} ₽
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Начальная цена">
                {selectedAuction.starting_price} ₽
              </Descriptions.Item>
              <Descriptions.Item label="Шаг торгов">
                {selectedAuction.bid_step} ₽
              </Descriptions.Item>
              <Descriptions.Item label="Начало">
                {new Date(selectedAuction.start_time).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Окончание">
                {new Date(selectedAuction.end_time).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>

            {selectedAuction.is_active_now && (
              <Card 
                title="Сделать ставку" 
                style={{ marginBottom: 24, backgroundColor: '#f0f5ff' }}
                size="small"
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary">Минимальная ставка:</Text>
                    <br />
                    <InputNumber
                      style={{ width: '100%', marginTop: 8 }}
                      value={bidAmount}
                      onChange={setBidAmount}
                      min={Math.max(selectedAuction.starting_price, Number(selectedAuction.current_bid) + Number(selectedAuction.bid_step))}
                      step={selectedAuction.bid_step}
                      formatter={value => `${value} ₽`}
                      parser={value => value.replace(' ₽', '')}
                      size="large"
                    />
                  </div>
                  <Button 
                    type="primary" 
                    size="large"
                    loading={submittingBid}
                    onClick={handlePlaceBid}
                    style={{ height: 64 }}
                  >
                    Сделать ставку
                  </Button>
                </div>
              </Card>
            )}

            <Title level={5}>История ставок ({auctionBids.length})</Title>
            {renderAuctionBidsTable()}
          </div>
        ) : (
          <p>Данные аукциона не найдены</p>
        )}
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

      {/* Модалка редактирования профиля */}
      <Modal
        title="Редактировать профиль"
        open={isEditModalOpen}
        onCancel={closeEditModal}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Form.Item name="first_name" label="Имя" rules={[{ validator: validateName }]}>
            <Input />
          </Form.Item>
          <Form.Item name="last_name" label="Фамилия" rules={[{ validator: validateName }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Новый пароль" rules={[{ validator: validatePassword }]}>
            <Input.Password onChange={handlePasswordChange} placeholder="Оставьте пустым, чтобы не менять" />
          </Form.Item>

          {passwordText && (
            <Progress
              percent={(passwordScore + 1) * 20}
              status={passwordStatus.status}
              showInfo
              format={() => passwordStatus.text}
            />
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;