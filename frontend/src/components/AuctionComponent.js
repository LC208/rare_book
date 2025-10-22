import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Card, Button, InputNumber, Modal, Table, message, Tag, Descriptions, Statistic, Space, Empty, Spin, Typography } from "antd";
import { ClockCircleOutlined, TrophyOutlined, DollarOutlined, FireOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Countdown } = Statistic;

const AuctionComponent = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBids, setLoadingBids] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Получаем текущего пользователя
  useEffect(() => {
    axios.get("users/profile/")
      .then(res => setCurrentUser(res.data))
      .catch(err => console.error(err));
  }, []);

  // Получаем список всех аукционов
  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("auctions/history/");
      setAuctions(res.data);
    } catch (err) {
      message.error("Ошибка при загрузке аукционов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Получаем список ставок для конкретного аукциона
  const fetchBids = async (auctionId) => {
    setLoadingBids(true);
    try {
      const res = await axios.get(`auctions/${auctionId}/bids/`);
      setBids(res.data);
    } catch (err) {
      message.error("Ошибка при загрузке ставок");
      console.error(err);
    } finally {
      setLoadingBids(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    // Обновляем данные каждые 30 секунд
    const interval = setInterval(fetchAuctions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Открыть модальное окно с деталями аукциона
  const openAuctionDetails = async (auction) => {
    setSelectedAuction(auction);
    setModalVisible(true);
    setBidAmount(null);
    
    await fetchBids(auction.id);
    
    // Устанавливаем минимальную ставку
    const minBid = Math.max(
      auction.starting_price,
      Number(auction.current_bid) + Number(auction.bid_step)
    );
    setBidAmount(minBid);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAuction(null);
    setBids([]);
    setBidAmount(null);
  };

  // Сделать ставку
  const handleBid = async () => {
    if (!bidAmount || bidAmount <= 0) {
      message.warning("Введите корректную сумму ставки");
      return;
    }

    setSubmittingBid(true);
    try {
      await axios.post("auctions/bids/", {
        auction: selectedAuction.id,
        amount: bidAmount,
      });
      
      message.success("Ставка успешно сделана!");
      
      // Обновляем данные
      const [auctionRes, bidsRes, auctionsRes] = await Promise.all([
        axios.get(`auctions/${selectedAuction.id}/`),
        axios.get(`auctions/${selectedAuction.id}/bids/`),
        axios.get("auctions/history/")
      ]);
      
      setSelectedAuction(auctionRes.data);
      setBids(bidsRes.data);
      setAuctions(auctionsRes.data);
      
      // Обновляем минимальную ставку
      const minBid = Math.max(
        auctionRes.data.starting_price,
        Number(auctionRes.data.current_bid) + Number(auctionRes.data.bid_step)
      );
      setBidAmount(minBid);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 
                       err.response?.data?.detail || 
                       "Ошибка при создании ставки";
      message.error(errorMsg);
    } finally {
      setSubmittingBid(false);
    }
  };

  // Получить тег статуса
  const getStatusTag = (statusDisplay, isActiveNow) => {
    const statusMap = {
      "Запланирован": { color: "blue", icon: <ClockCircleOutlined /> },
      "Активен": { color: "green", icon: <FireOutlined /> },
      "Завершён": { color: "default", icon: null },
      "Отменён": { color: "red", icon: null }
    };
    
    const config = statusMap[statusDisplay] || { color: "default", icon: null };
    
    return (
      <Tag color={config.color} icon={config.icon}>
        {statusDisplay}
      </Tag>
    );
  };

  // Проверка, является ли пользователь лидером
  const isLeadingBidder = () => {
    if (!currentUser || !bids.length) return false;
    return bids[0]?.user_email === currentUser.email;
  };

  // Таблица аукционов
  const auctionColumns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    { 
      title: "Товар", 
      dataIndex: "product_title",
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: "Стартовая цена", 
      dataIndex: "starting_price",
      align: "right",
      render: (price) => `${price} ₽`,
      sorter: (a, b) => a.starting_price - b.starting_price,
    },
    { 
      title: "Текущая ставка", 
      dataIndex: "current_bid",
      align: "right",
      render: (bid) => (
        <Text strong style={{ fontSize: 16, color: bid > 0 ? '#52c41a' : '#999' }}>
          {bid > 0 ? `${bid} ₽` : '—'}
        </Text>
      ),
      sorter: (a, b) => a.current_bid - b.current_bid,
    },
    {
      title: "Статус",
      dataIndex: "status_display",
      filters: [
        { text: "Запланирован", value: "Запланирован" },
        { text: "Активен", value: "Активен" },
        { text: "Завершён", value: "Завершён" },
        { text: "Отменён", value: "Отменён" },
      ],
      onFilter: (value, record) => record.status_display === value,
      render: (text, record) => getStatusTag(text, record.is_active_now),
    },
    {
      title: "Начало",
      dataIndex: "start_time",
      render: (t) => moment(t).format("DD.MM.YYYY HH:mm"),
      sorter: (a, b) => moment(a.start_time).unix() - moment(b.start_time).unix(),
    },
    {
      title: "Окончание",
      dataIndex: "end_time",
      render: (t) => moment(t).format("DD.MM.YYYY HH:mm"),
      sorter: (a, b) => moment(a.end_time).unix() - moment(b.end_time).unix(),
    },
    {
      title: "Действия",
      width: 120,
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => openAuctionDetails(record)}
        >
          Подробнее
        </Button>
      ),
    },
  ];

  // Таблица ставок внутри модалки
  const bidColumns = [
    { 
      title: "Участник", 
      dataIndex: "user_email",
      render: (email, record, index) => {
        const isCurrentUser = currentUser && email === currentUser.email;
        return (
          <Space>
            <Text>{email}</Text>
            {index === 0 && <TrophyOutlined style={{ color: '#faad14', fontSize: 16 }} />}
            {isCurrentUser && <Tag color="blue">Вы</Tag>}
          </Space>
        );
      }
    },
    { 
      title: "Ставка", 
      dataIndex: "amount",
      align: "right",
      render: (amount, record, index) => (
        <Text 
          strong 
          style={{ 
            fontSize: 16, 
            color: index === 0 ? '#52c41a' : '#1890ff' 
          }}
        >
          {amount} ₽
        </Text>
      )
    },
    {
      title: "Время",
      dataIndex: "created_at",
      render: (t) => moment(t).format("DD.MM.YYYY HH:mm:ss"),
    },
  ];

  // Фильтр активных аукционов
  const activeAuctions = auctions.filter(a => a.is_active_now);
  const upcomingAuctions = auctions.filter(a => a.status_display === "Запланирован");
  const completedAuctions = auctions.filter(a => a.status_display === "Завершён" || a.status_display === "Отменён");

  return (
    <div style={{ maxWidth: 1400, margin: "20px auto", padding: "0 20px" }}>
      <Title level={2}>Аукционы</Title>

      {/* Статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card>
          <Statistic
            title="Активных аукционов"
            value={activeAuctions.length}
            prefix={<FireOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Запланировано"
            value={upcomingAuctions.length}
            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Завершено"
            value={completedAuctions.length}
            valueStyle={{ color: '#999' }}
          />
        </Card>
      </div>

      {/* Таблица аукционов */}
      <Card>
        <Table
          columns={auctionColumns}
          dataSource={auctions}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего аукционов: ${total}`,
          }}
          locale={{
            emptyText: <Empty description="Нет доступных аукционов" />
          }}
        />
      </Card>

      {/* Модальное окно с деталями */}
      <Modal
        title={
          <Space>
            <span>Аукцион #{selectedAuction?.id}</span>
            {selectedAuction && getStatusTag(selectedAuction.status_display, selectedAuction.is_active_now)}
          </Space>
        }
        open={modalVisible}
        onCancel={closeModal}
        width={900}
        footer={null}
      >
        {selectedAuction && (
          <div>
            {/* Основная информация */}
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Товар" span={2}>
                <Text strong style={{ fontSize: 16 }}>{selectedAuction.product_title}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Текущая ставка">
                <Text style={{ fontSize: 20, color: '#52c41a', fontWeight: 'bold' }}>
                  {selectedAuction.current_bid > 0 ? `${selectedAuction.current_bid} ₽` : 'Нет ставок'}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Шаг торгов">
                <Text strong>{selectedAuction.bid_step} ₽</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Начальная цена">
                {selectedAuction.starting_price} ₽
              </Descriptions.Item>
              
              <Descriptions.Item label="Всего ставок">
                {bids.length}
              </Descriptions.Item>
              
              <Descriptions.Item label="Начало аукциона">
                {moment(selectedAuction.start_time).format("DD.MM.YYYY HH:mm")}
              </Descriptions.Item>
              
              <Descriptions.Item label="Окончание аукциона">
                {moment(selectedAuction.end_time).format("DD.MM.YYYY HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            {/* Таймер для активных аукционов */}
            {selectedAuction.is_active_now && (
              <Card 
                style={{ 
                  marginBottom: 24, 
                  backgroundColor: '#f6ffed',
                  borderColor: '#b7eb8f' 
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">Аукцион завершится через:</Text>
                  <Countdown 
                    value={moment(selectedAuction.end_time).valueOf()} 
                    format="D дней HH:mm:ss"
                    valueStyle={{ fontSize: 24, color: '#52c41a' }}
                  />
                </div>
              </Card>
            )}

            {/* Форма ставки */}
            {selectedAuction.is_active_now ? (
              <Card 
                title={
                  <Space>
                    <DollarOutlined />
                    <span>Сделать ставку</span>
                    {isLeadingBidder() && (
                      <Tag color="gold" icon={<TrophyOutlined />}>
                        Вы лидируете!
                      </Tag>
                    )}
                  </Space>
                }
                style={{ marginBottom: 24, backgroundColor: '#f0f5ff' }}
                size="small"
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text type="secondary">
                      Минимальная ставка:
                    </Text>
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
                    onClick={handleBid}
                    style={{ height: 64, minWidth: 140 }}
                  >
                    Сделать ставку
                  </Button>
                </div>
              </Card>
            ) : (
              <Card style={{ marginBottom: 24, backgroundColor: '#f5f5f5' }}>
                <div style={{ textAlign: 'center' }}>
                  <Tag color="default" style={{ fontSize: 14, padding: '8px 16px' }}>
                    {selectedAuction.status_display === "Запланирован" ? 'Аукцион запланирован' : 'Аукцион завершен'}
                  </Tag>
                </div>
              </Card>
            )}

            {/* История ставок */}
            <Title level={5}>История ставок ({bids.length})</Title>
            {loadingBids ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                columns={bidColumns}
                dataSource={bids}
                rowKey="id"
                size="small"
                pagination={false}
                locale={{
                  emptyText: <Empty description="Пока нет ставок" />
                }}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuctionComponent;