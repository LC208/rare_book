import React, { useEffect, useState } from "react";
import { Card, Table, Button, Tabs, Spin, Typography, Space, message, Drawer, Form, Input, Select, Switch, InputNumber, DatePicker } from "antd";
import { ReloadOutlined, EyeOutlined, SaveOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import moment from "moment";
import { Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

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

  // Состояния для поиска и фильтров
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [filters, setFilters] = useState({});

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

  // Функции для поиска и фильтрации
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText("");
    confirm();
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Поиск ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Поиск
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Сброс
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const recordValue = getNestedValue(record, dataIndex);
      return recordValue?.toString().toLowerCase().includes(value.toLowerCase()) || false;
    },
  });

  // Вспомогательная функция для получения вложенных значений
  const getNestedValue = (obj, path) => {
    if (typeof path === 'string') {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
    return obj[path];
  };

  const openDetails = (record) => {
    setSelectedRecord(record);
    setCreating(false);
    form.setFieldsValue({
      ...record,
      authors: record?.authors?.map(a => a.id) || [],
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

    const url = endpointMap[activeTab] + (creating ? "" : `${selectedRecord.id}/`);

    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === "photo" && value && value.file) {
        formData.append(key, value.file);
      } else if (Array.isArray(value)) {
        value.forEach(v => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (values.authors) values.authors.forEach(a => formData.append('authors_ids', a));
    if (values.genres) values.genres.forEach(g => formData.append('genres_ids', g));
    if (values.publisher) formData.append('publisher_id', values.publisher);

    try {
      setSaving(true);
      if (creating) {
        await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      message.success(`Книга успешно ${creating ? "создана" : "обновлена"}`);
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

            <Form.Item name="photo" label="Обложка книги" valuePropName="file">
              <Dragger
                name="photo"
                listType="picture"
                beforeUpload={() => false}
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Перетащите файл или кликните для загрузки</p>
              </Dragger>
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
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Название", 
        dataIndex: "title",
        sorter: (a, b) => a.title.localeCompare(b.title),
        ...getColumnSearchProps('title', 'название')
      },
      { 
        title: "Автор", 
        render: (_, record) => record.authors?.map(a => a.name).join(", ") || "-",
        filters: [...new Set(books.flatMap(b => b.authors?.map(a => a.name) || []))].map(name => ({
          text: name,
          value: name,
        })),
        onFilter: (value, record) => record.authors?.some(a => a.name === value),
        filterSearch: true,
      },
      { 
        title: "Цена", 
        dataIndex: "price", 
        align: "right", 
        render: val => `${val} ₽`,
        sorter: (a, b) => a.price - b.price,
      },
      { 
        title: "Состояние", 
        dataIndex: "condition_display",
        filters: [
          { text: 'Отличное', value: 'Отличное' },
          { text: 'Хорошее', value: 'Хорошее' },
          { text: 'Удовлетворительное', value: 'Удовлетворительное' },
        ],
        onFilter: (value, record) => record.condition_display === value,
      },
      { 
        title: "Жанр", 
        render: (_, record) => record.genres?.map(g => g.name).join(", ") || "-",
        filters: [...new Set(books.flatMap(b => b.genres?.map(g => g.name) || []))].map(name => ({
          text: name,
          value: name,
        })),
        onFilter: (value, record) => record.genres?.some(g => g.name === value),
        filterSearch: true,
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
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Пользователь", 
        dataIndex: "user_email",
        sorter: (a, b) => a.user_email.localeCompare(b.user_email),
        ...getColumnSearchProps('user_email', 'email пользователя')
      },
      { 
        title: "Статус", 
        dataIndex: "status_display",
        filters: [
          { text: 'Ожидает оплаты', value: 'Ожидает оплаты' },
          { text: 'Оплачен', value: 'Оплачен' },
          { text: 'Отменён', value: 'Отменён' },
        ],
        onFilter: (value, record) => record.status_display === value,
      },
      { 
        title: "Оплата", 
        dataIndex: "payment_display",
        filters: [
          { text: 'При получении', value: 'При получении' },
          { text: 'Картой', value: 'Картой' },
        ],
        onFilter: (value, record) => record.payment_display === value,
      },
      { 
        title: "Сумма", 
        dataIndex: "amount", 
        align: "right", 
        render: val => `${val} ₽`,
        sorter: (a, b) => a.amount - b.amount,
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
    auctions: [
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Книга", 
        dataIndex: ["product", "title"],
        sorter: (a, b) => a.product?.title?.localeCompare(b.product?.title),
        ...getColumnSearchProps('product.title', 'название книги')
      },
      { 
        title: "Стартовая цена", 
        dataIndex: "starting_price", 
        align: "right", 
        render: val => `${val} ₽`,
        sorter: (a, b) => a.starting_price - b.starting_price,
      },
      { 
        title: "Текущая ставка", 
        dataIndex: "current_bid", 
        align: "right", 
        render: val => `${val} ₽`,
        sorter: (a, b) => (a.current_bid || 0) - (b.current_bid || 0),
      },
      { 
        title: "Статус", 
        dataIndex: "status_display",
        filters: [
          { text: 'Запланирован', value: 'Запланирован' },
          { text: 'Активен', value: 'Активен' },
          { text: 'Завершён', value: 'Завершён' },
          { text: 'Отменён', value: 'Отменён' },
        ],
        onFilter: (value, record) => record.status_display === value,
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
    bids: [
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Аукцион", 
        dataIndex: ["auction", "id"],
        sorter: (a, b) => a.auction?.id - b.auction?.id,
        ...getColumnSearchProps('auction.id', 'ID аукциона')
      },
      { 
        title: "Пользователь", 
        dataIndex: "user_email",
        sorter: (a, b) => a.user_email.localeCompare(b.user_email),
        ...getColumnSearchProps('user_email', 'email пользователя')
      },
      { 
        title: "Ставка", 
        dataIndex: "amount", 
        align: "right", 
        render: val => `${val} ₽`,
        sorter: (a, b) => a.amount - b.amount,
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
    users: [
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Email", 
        dataIndex: "email",
        sorter: (a, b) => a.email.localeCompare(b.email),
        ...getColumnSearchProps('email', 'email')
      },
      { 
        title: "Имя", 
        dataIndex: "first_name",
        sorter: (a, b) => a.first_name.localeCompare(b.first_name),
        ...getColumnSearchProps('first_name', 'имя')
      },
      { 
        title: "Фамилия", 
        dataIndex: "last_name",
        sorter: (a, b) => a.last_name.localeCompare(b.last_name),
        ...getColumnSearchProps('last_name', 'фамилию')
      },
      { 
        title: "Статус", 
        dataIndex: "status_display",
        filters: [
          { text: 'Активен', value: 'Активен' },
          { text: 'Заблокирован', value: 'Заблокирован' },
        ],
        onFilter: (value, record) => record.status_display === value,
      },
      { 
        title: "Админ", 
        dataIndex: "is_admin", 
        render: val => val ? "Да" : "Нет",
        filters: [
          { text: 'Да', value: true },
          { text: 'Нет', value: false },
        ],
        onFilter: (value, record) => record.is_admin === value,
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
    authors: [
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Имя автора", 
        dataIndex: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...getColumnSearchProps('name', 'имя автора')
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
    genres: [
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Название жанра", 
        dataIndex: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...getColumnSearchProps('name', 'название жанра')
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
    publishers: [
      { 
        title: "ID", 
        dataIndex: "id", 
        width: 80,
        sorter: (a, b) => a.id - b.id,
        ...getColumnSearchProps('id', 'ID')
      },
      { 
        title: "Название издательства", 
        dataIndex: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...getColumnSearchProps('name', 'название издательства')
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
          onChange={key => {
            setActiveTab(key);
            setSearchText("");
            setSearchedColumn("");
          }}
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
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Заказы" key="orders">
            <Table 
              dataSource={dataSourceMap.orders} 
              columns={columns.orders} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Аукционы" key="auctions">
            <Table 
              dataSource={dataSourceMap.auctions} 
              columns={columns.auctions} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Ставки" key="bids">
            <Table 
              dataSource={dataSourceMap.bids} 
              columns={columns.bids} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Пользователи" key="users">
            <Table 
              dataSource={dataSourceMap.users} 
              columns={columns.users} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Авторы" key="authors">
            <Table 
              dataSource={dataSourceMap.authors} 
              columns={columns.authors} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Жанры" key="genres">
            <Table 
              dataSource={dataSourceMap.genres} 
              columns={columns.genres} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
          <TabPane tab="Издательства" key="publishers">
            <Table 
              dataSource={dataSourceMap.publishers} 
              columns={columns.publishers} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
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