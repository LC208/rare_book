import React, { useEffect, useState } from "react";
import { Card, Table, Button, Tabs, Spin, Typography, Space, message, Drawer, Form, Input, Select, Switch, InputNumber, DatePicker } from "antd";
import { ReloadOutlined, EyeOutlined, SaveOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import moment from "moment";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const DashboardContent = () => {

  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("books");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();

  const fetchData = async (endpoint, setter) => {
    try {
      setLoading(true);
      const res = await axios.get(endpoint);
      setter(res.data);
    } catch (err) {
      message.error(`Ошибка загрузки данных: ${err.response?.data?.message || err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData("dashboard/books/", setBooks);
    fetchData("dashboard/orders/", setOrders);
    fetchData("dashboard/auctions/", setAuctions);
    fetchData("dashboard/bids/", setBids);
    fetchData("dashboard/users/", setUsers);
    fetchData("dashboard/authors/", setAuthors);
    fetchData("dashboard/genres/", setGenres);
    fetchData("dashboard/publishers/", setPublishers);
  }, []);

  const openDetails = (record) => {
    setSelectedRecord(record);
    setCreating(false);
    form.setFieldsValue({
      ...record,
      authors: record?.authors?.map(a => a.id) || [], // всегда массив
      genres: record?.genres?.map(g => g.id) || [],   
      publisher: record?.publisher?.id,
      product: record?.product?.id,
      auction: record?.auction?.id,
      start_time: record?.start_time ? moment(record.start_time) : null,
      end_time: record?.end_time ? moment(record.end_time) : null
    });
    setDrawerVisible(true);
  };

  const openCreate = () => {
    setSelectedRecord(null);
    setCreating(true);
    form.resetFields();
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedRecord(null);
    setCreating(false);
    form.resetFields();
  };

  const handleRefresh = () => {
    const endpointMap = {
      books: () => fetchData("dashboard/books/", setBooks),
      orders: () => fetchData("dashboard/orders/", setOrders),
      auctions: () => fetchData("dashboard/auctions/", setAuctions),
      bids: () => fetchData("dashboard/bids/", setBids),
      users: () => fetchData("dashboard/users/", setUsers),
      authors: () => fetchData("dashboard/authors/", setAuthors),
      genres: () => fetchData("dashboard/genres/", setGenres),
      publishers: () => fetchData("dashboard/publishers/", setPublishers),
    };
    endpointMap[activeTab]?.();
  };

  const saveRecord = async (values) => {
    const endpointMap = {
      books: "dashboard/books/",
      orders: "dashboard/orders/",
      auctions: "dashboard/auctions/",
      bids: "dashboard/bids/",
      users: "dashboard/users/",
      authors: "dashboard/authors/",
      genres: "dashboard/genres/",
      publishers: "dashboard/publishers/",
    };

    if (activeTab === "auctions") {
      values.start_time = values.start_time?.toISOString();
      values.end_time = values.end_time?.toISOString();
    }
    

    const url = endpointMap[activeTab] + (creating ? "" : `${selectedRecord.id}/`);
    const valuesToSend = {
      ...values,
      authors_ids: values.authors,   // сериализатор ожидает authors_ids
      genres_ids: values.genres,     // сериализатор ожидает genres_ids
      publisher_id: values.publisher // сериализатор ожидает publisher_id
    };
    try {
      setSaving(true);
      if (creating) {
        await axios.post(url, valuesToSend);
      } else {
        await axios.put(url, valuesToSend);
      }

      const labels = {
        books: "Книга",
        orders: "Заказ",
        auctions: "Аукцион",
        bids: "Ставка",
        users: "Пользователь",
        authors: "Автор",
        genres: "Жанр",
        publishers: "Издательство"
      };
      
      message.success(`${labels[activeTab]} успешно ${creating ? "создан" : "обновлён"}`);
      handleRefresh();
      closeDrawer();
    } catch (err) {
      message.error(`Ошибка: ${err.response?.data?.message || err.message}`);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case "books":
        return (
          <>
            <Form.Item name="title" label="Название" rules={[{ required: true, message: "Введите название" }]}>
              <Input maxLength={50} />
            </Form.Item>

            <Form.Item name="authors" label="Авторы" rules={[{ required: true, message: "Выберите автора(ов)" }]}>
              <Select mode="multiple" placeholder="Выберите автора" optionFilterProp="children">
                {authors.map(a => (
                  <Option key={`author-${a.id}`} value={a.id}>
                    {a.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="year" label="Год издания" rules={[{ required: true, message: "Введите год" }]}>
              <InputNumber min={1000} max={new Date().getFullYear()} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="genres" label="Жанры" rules={[{ required: true, message: "Выберите жанр(ы)" }]}>
              <Select mode="multiple" placeholder="Выберите жанр" optionFilterProp="children">
                {genres.map(g => (
                  <Option key={`genre-${g.id}`} value={g.id}>
                    {g.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="publisher" label="Издательство" rules={[{ required: true }]}>
              <Select placeholder="Выберите издательство">
                {publishers.map(p => (
                  <Option key={`publisher-${p.id}`} value={p.id}>
                    {p.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="condition" label="Состояние" rules={[{ required: true }]}>
              <Select>
                <Option value={1}>Отличное</Option>
                <Option value={2}>Хорошее</Option>
                <Option value={3}>Удовлетворительное</Option>
              </Select>
            </Form.Item>

            <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
              <Select>
                <Option value={1}>К продаже</Option>
                <Option value={2}>Продано</Option>
                <Option value={3}>На аукционе</Option>
                <Option value={4}>Заблокировано</Option>
              </Select>
            </Form.Item>

            <Form.Item name="price" label="Цена" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
              <Input.TextArea maxLength={250} rows={4} />
            </Form.Item>
          </>
        );


      case "auctions":
        return (
          <>
            <Form.Item name="product" label="Книга" rules={[{ required: true, message: "Выберите книгу" }]}>
              <Select placeholder="Выберите книгу">
                {books.filter(b => b.status === 3).map(b => (
                  <Option key={b.id} value={b.id}>{b.title}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="starting_price" label="Начальная цена" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="bid_step" label="Шаг торгов" rules={[{ required: true }]}>
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="start_time" label="Начало аукциона" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="end_time" label="Конец аукциона" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
              <Select>
                <Option value={1}>Запланирован</Option>
                <Option value={2}>Активен</Option>
                <Option value={3}>Завершён</Option>
                <Option value={4}>Отменён</Option>
              </Select>
            </Form.Item>
          </>
        );

      case "users":
        return (
          <>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item name="first_name" label="Имя" rules={[{ required: true }]}>
              <Input maxLength={50} />
            </Form.Item>
            <Form.Item name="last_name" label="Фамилия" rules={[{ required: true }]}>
              <Input maxLength={50} />
            </Form.Item>
            {creating && (
              <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 8 }]}>
                <Input.Password />
              </Form.Item>
            )}
            <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
              <Select>
                <Option value={1}>Активен</Option>
                <Option value={2}>Заблокирован</Option>
              </Select>
            </Form.Item>
            <Form.Item name="is_admin" label="Администратор" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        );

      case "authors":
        return (
          <Form.Item name="name" label="Имя автора" rules={[{ required: true, message: "Введите имя автора" }]}>
            <Input maxLength={100} />
          </Form.Item>
        );

      case "genres":
        return (
          <Form.Item name="name" label="Название жанра" rules={[{ required: true, message: "Введите название жанра" }]}>
            <Input maxLength={50} />
          </Form.Item>
        );

      case "publishers":
        return (
          <Form.Item name="name" label="Название издательства" rules={[{ required: true, message: "Введите название издательства" }]}>
            <Input maxLength={50} />
          </Form.Item>
        );

      case "orders":
        return (
          <>
            <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
              <Select>
                <Option value="P">Ожидает оплаты</Option>
                <Option value="A">Оплачен</Option>
                <Option value="C">Отменён</Option>
              </Select>
            </Form.Item>
            <Form.Item name="payment" label="Способ оплаты" rules={[{ required: true }]}>
              <Select>
                <Option value="H">При получении</Option>
                <Option value="C">Картой</Option>
              </Select>
            </Form.Item>
          </>
        );

      case "bids":
        return (
          <>
            <Form.Item label="Аукцион">
              <Input value={selectedRecord?.auction?.id} disabled />
            </Form.Item>
            <Form.Item label="Пользователь">
              <Input value={selectedRecord?.user_email} disabled />
            </Form.Item>
            <Form.Item label="Ставка">
              <Input value={selectedRecord?.amount} disabled />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };
  
  
  const columns = {
    books: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Название", dataIndex: "title" },
      { 
        title: "Автор", 
        
        render: (_, record) => record.authors?.map(a => a.name).join(", ") || "-" 
      },
      { title: "Цена", dataIndex: "price", align: "right", render: val => `${val} ₽` },
      { title: "Состояние", dataIndex: "condition_display" },
      { 
        title: "Жанр", 
        render: (_, record) => record.genres?.map(g => g.name).join(", ") || "-" 
      },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    orders: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Пользователь", dataIndex: "user_email" },
      { title: "Статус", dataIndex: "status_display" },
      { title: "Оплата", dataIndex: "payment_display" },
      { title: "Сумма", dataIndex: "amount", align: "right", render: val => `${val} ₽` },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    auctions: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Книга", dataIndex: ["product", "title"] },
      { title: "Стартовая цена", dataIndex: "starting_price", align: "right", render: val => `${val} ₽` },
      { title: "Текущая ставка", dataIndex: "current_bid", align: "right", render: val => `${val} ₽` },
      { title: "Статус", dataIndex: "status_display" },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    bids: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Аукцион", dataIndex: ["auction", "id"] },
      { title: "Пользователь", dataIndex: "user_email" },
      { title: "Ставка", dataIndex: "amount", align: "right", render: val => `${val} ₽` },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    users: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Email", dataIndex: "email" },
      { title: "Имя", dataIndex: "first_name" },
      { title: "Фамилия", dataIndex: "last_name" },
      { title: "Статус", dataIndex: "status_display" },
      { title: "Админ", dataIndex: "is_admin", render: val => val ? "Да" : "Нет" },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    authors: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Имя автора", dataIndex: "name" },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    genres: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Название жанра", dataIndex: "name" },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
    publishers: [
      { title: "ID", dataIndex: "id", width: 80 },
      { title: "Название издательства", dataIndex: "name" },
      { 
        title: "Действия", 
        render: (_, record) => (
          <Button icon={<EyeOutlined />} onClick={() => openDetails(record)}>
            Подробнее
          </Button>
        ) 
      },
    ],
  };

  const dataSourceMap = {
    books,
    orders,
    auctions,
    bids,
    users,
    authors,
    genres,
    publishers
  };

  const getCreateButtonLabel = () => {
    const labels = {
      users: "пользователя",
      books: "книгу",
      auctions: "аукцион",
      authors: "автора",
      genres: "жанр",
      publishers: "издательство"
    };
    return `Добавить ${labels[activeTab] || activeTab}`;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Space style={{ marginBottom: 16, justifyContent: "space-between", width: "100%" }}>
        <Title level={3}>Панель администратора</Title>
      </Space>

      <Card>
        {["books", "auctions", "users", "authors", "genres", "publishers"].includes(activeTab) && (
          <Button 
            type="primary" 
            style={{ marginBottom: 16 }} 
            icon={<PlusOutlined />} 
            onClick={openCreate}
          >
            {getCreateButtonLabel()}
          </Button>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key)}
          tabBarExtraContent={
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              Обновить
            </Button>
          }
        >
          <TabPane tab="Книги" key="books">
            <Table 
              dataSource={dataSourceMap.books} 
              columns={columns.books} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Заказы" key="orders">
            <Table 
              dataSource={dataSourceMap.orders} 
              columns={columns.orders} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Аукционы" key="auctions">
            <Table 
              dataSource={dataSourceMap.auctions} 
              columns={columns.auctions} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Ставки" key="bids">
            <Table 
              dataSource={dataSourceMap.bids} 
              columns={columns.bids} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Пользователи" key="users">
            <Table 
              dataSource={dataSourceMap.users} 
              columns={columns.users} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Авторы" key="authors">
            <Table 
              dataSource={dataSourceMap.authors} 
              columns={columns.authors} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Жанры" key="genres">
            <Table 
              dataSource={dataSourceMap.genres} 
              columns={columns.genres} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="Издательства" key="publishers">
            <Table 
              dataSource={dataSourceMap.publishers} 
              columns={columns.publishers} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Drawer
        title={creating ? `Создать ${activeTab}` : `Редактировать ${activeTab}`}
        width={600}
        onClose={closeDrawer}
        open={drawerVisible}
        footer={
          activeTab !== "bids" && (
            <Space style={{ float: "right" }}>
              <Button onClick={closeDrawer}>Отмена</Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={() => form.submit()}
                loading={saving}
              >
                Сохранить
              </Button>
            </Space>
          )
        }
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={saveRecord}
        >
          {renderFormFields()}
        </Form>
      </Drawer>
    </div>
  );
};

export default DashboardContent;