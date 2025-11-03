import React, { useEffect, useState } from "react";
import { Card, Table, Button, Tabs, Typography, Space, message, Drawer, Form, Input, Select, Switch, InputNumber, DatePicker, Modal, Upload } from "antd";
import { ReloadOutlined, EditOutlined, SaveOutlined, PlusOutlined, SearchOutlined, InboxOutlined } from "@ant-design/icons";
import axios from "../utils/axios";
import dayjs from "dayjs";

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
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState("books");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [referenceTab, setReferenceTab] = useState("authors");
  const [form] = Form.useForm();

  const rowSelection = (["books", "users", "auctions", "donors", "orders"].includes(activeTab) || (activeTab === "references" && ["authors", "genres", "publishers"].includes(referenceTab))) ? {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  } : undefined;

  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      for (const id of selectedRowKeys) {
        await axios.delete(`dashboard/${activeTab}/${id}/`);
      }
      message.success("Выбранные записи удалены");
      setSelectedRowKeys([]);
      handleRefresh();
    } catch (err) {
      message.error(`Ошибка при удалении: ${err.response?.data?.message || err.message}`);
    }
  };

  const showBookModal = (book) => {
    setSelectedBook(book);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
  };

  const fetchData = async (endpoint, setter) => {
    try {
      setLoading(true);
      const res = await axios.get(endpoint);
      setter(res.data);
    } catch (err) {
      message.error(`Ошибка загрузки данных: ${err.response?.data?.message || err.message}`);
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
    fetchData("dashboard/donors/", setDonors);
  }, []);

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
          <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Поиск</Button>
          <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>Сброс</Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const recordValue = getNestedValue(record, dataIndex);
      return recordValue?.toString().toLowerCase().includes(value.toLowerCase()) || false;
    },
  });

  const getNestedValue = (obj, path) => {
    if (typeof path === 'string') {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
    return obj[path];
  };

  const openSelectedRecord = () => {
    const id = selectedRowKeys[0];
    let record = null;
    if (activeTab === "books") record = books.find(b => b.id === id);
    else if (activeTab === "users") record = users.find(u => u.id === id);
    else if (activeTab === "auctions") record = auctions.find(a => a.id === id);
    else if (activeTab === "donors") record = donors.find(d => d.id === id);
    else if (activeTab === "references") {
      if (referenceTab === "authors") record = authors.find(a => a.id === id);
      if (referenceTab === "genres") record = genres.find(g => g.id === id);
      if (referenceTab === "publishers") record = publishers.find(p => p.id === id);
    }
    if (record) openDetails(record);
  };

  const openDetails = (record) => {
    setSelectedRecord(record);
    setCreating(false);
    form.setFieldsValue({
      ...record,
      authors: record?.authors?.map(a => a.id) || [],
      genres: record?.genres?.map(g => g.id) || [],
      publisher: record?.publisher?.id,
      product: record?.product,
      auction: record?.auction?.id,
      start_time: record?.start_time ? dayjs(record.start_time) : null,
      end_time: record?.end_time ? dayjs(record.end_time) : null
    });
    if (activeTab === "orders" && record.items) {
      setOrderItems(record.items);
    } else {
      setOrderItems([]);
    }
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
      donors: () => fetchData("dashboard/donors/", setDonors),
      references: () => {
        const map = {
          authors: () => fetchData("dashboard/authors/", setAuthors),
          genres: () => fetchData("dashboard/genres/", setGenres),
          publishers: () => fetchData("dashboard/publishers/", setPublishers),
        };
        map[referenceTab]?.();
      }
    };
    endpointMap[activeTab]?.();
  };

    const handleUpdateOrderStatus = async (orderId, statusCode) => {
    try {
      setLoading(true);
      await axios.patch(`dashboard/orders/${orderId}/update_status/`, { status: statusCode });
      message.success(statusCode === "A" ? "Оплата подтверждена" : "Заказ отменён");
      handleRefresh();
    } catch (err) {
      message.error(`Ошибка: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (values) => {
    let endpoint = "";
    if (activeTab === "references") {
      const map = { authors: "dashboard/authors/", genres: "dashboard/genres/", publishers: "dashboard/publishers/" };
      endpoint = map[referenceTab];
    } else {
      const map = { books: "dashboard/books/", orders: "dashboard/orders/", auctions: "dashboard/auctions/", bids: "dashboard/bids/", users: "dashboard/users/", donors: "dashboard/donors/" };
      endpoint = map[activeTab];
    }
    if (!endpoint) return;

    const url = endpoint + (creating ? "" : `${selectedRecord.id}/`);
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (key === "photo") {
        if (value && value.originFileObj) formData.append(key, value.originFileObj);
      } else if (key === "start_time" || key === "end_time") {
        if (activeTab === "auctions" && value) formData.append(key, value.toISOString());
      } else if (Array.isArray(value)) {
        value.forEach(v => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (activeTab === "books") {
      if (values.authors) values.authors.forEach(a => formData.append('authors_ids', a));
      if (values.genres) values.genres.forEach(g => formData.append('genres_ids', g));
      if (values.publisher) formData.append('publisher_id', values.publisher);
      if (values.donor) formData.append('donor_id', values.donor);
    }

    try {
      setSaving(true);
      if (creating) {
        await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      message.success(`${creating ? "Создано" : "Обновлено"} успешно`);
      handleRefresh();
      closeDrawer();
    } catch (err) {
      message.error(`Ошибка: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const renderFormFields = () => {
    if (activeTab === "references") {
      const fieldMap = { authors: "Имя автора", genres: "Название жанра", publishers: "Название издательства" };
      return <Form.Item name="name" label={fieldMap[referenceTab]} rules={[{ required: true, message: `Введите ${fieldMap[referenceTab].toLowerCase()}` }]}><Input maxLength={100} /></Form.Item>;
    }

    switch (activeTab) {
      case "books":
        return (<>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}><Input maxLength={50} /></Form.Item>
          <Form.Item name="authors" label="Авторы" rules={[{ required: true }]}><Select mode="multiple" placeholder="Выберите автора">{authors.map(a => <Option key={a.id} value={a.id}>{a.name}</Option>)}</Select></Form.Item>
          <Form.Item name="year" label="Год издания" rules={[{ required: true }]}><InputNumber min={1000} max={new Date().getFullYear()} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="genres" label="Жанры" rules={[{ required: true }]}><Select mode="multiple">{genres.map(g => <Option key={g.id} value={g.id}>{g.name}</Option>)}</Select></Form.Item>
          <Form.Item name="publisher" label="Издательство" rules={[{ required: true }]}><Select>{publishers.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}</Select></Form.Item>
          <Form.Item name="condition" label="Состояние" rules={[{ required: true }]}><Select><Option value={1}>Отличное</Option><Option value={2}>Хорошее</Option><Option value={3}>Удовлетворительное</Option></Select></Form.Item>
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}><Select><Option value={1}>К продаже</Option><Option value={2}>Продано</Option><Option value={3}>На аукционе</Option><Option value={4}>Заблокировано</Option></Select></Form.Item>
          <Form.Item name="donor" label="Сдатчик" rules={[{ required: true }]}><Select>{donors.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}</Select></Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="quantity" label="Количество" rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}><Input.TextArea maxLength={250} rows={4} /></Form.Item>
          <Form.Item name="photo" label="Обложка книги" valuePropName="file"><Dragger name="photo" listType="picture" beforeUpload={() => false} maxCount={1}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p className="ant-upload-text">Перетащите файл</p></Dragger></Form.Item>
        </>);
      case "donors":
        return (<>
          <Form.Item name="name" label="Имя сдатчика" rules={[{ required: true }]}><Input maxLength={100} /></Form.Item>
          <Form.Item name="phone" label="Телефон" rules={[{ required: true }]}><Input maxLength={20} /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: "email" }]}><Input maxLength={100} /></Form.Item>
        </>);
      case "auctions":
        return (<>
          <Form.Item name="product" label="Книга" rules={[{ required: true }]}><Select>{books.filter(b => b.status === 3).map(b => <Option key={b.id} value={b.id}>{b.title}</Option>)}</Select></Form.Item>
          <Form.Item name="starting_price" label="Начальная цена" rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="bid_step" label="Шаг торгов" rules={[{ required: true }]}><InputNumber min={0} precision={2} style={{ width: "100%" }} /></Form.Item>
<Form.Item
  name="start_time"
  label="Начало аукциона"
  rules={[{ required: true }]}
>
  <DatePicker
    showTime
    style={{ width: "100%" }}
    format="YYYY-MM-DD HH:mm:ss"
    disabledDate={current =>
      current && (current.isBefore(dayjs("2023-01-01")) || current.isAfter(dayjs("2030-12-31")))
    }
  />
</Form.Item>

<Form.Item
  name="end_time"
  label="Конец аукциона"
  rules={[{ required: true }]}
>
  <DatePicker
    showTime
    style={{ width: "100%" }}
    format="YYYY-MM-DD HH:mm:ss"
    disabledDate={current =>
      current && (current.isBefore(dayjs("2023-01-01")) || current.isAfter(dayjs("2030-12-31")))
    }
  />
</Form.Item>
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}><Select><Option value={1}>Запланирован</Option><Option value={2}>Активен</Option><Option value={3}>Завершён</Option><Option value={4}>Отменён</Option></Select></Form.Item>
        </>);
      case "users":
        return (<>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input maxLength={50} /></Form.Item>
          <Form.Item name="first_name" label="Имя" rules={[{ required: true }]}><Input maxLength={50} /></Form.Item>
          <Form.Item name="last_name" label="Фамилия" rules={[{ required: true }]}><Input maxLength={50} /></Form.Item>
          {creating && <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>}
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}><Select><Option value={1}>Активен</Option><Option value={2}>Заблокирован</Option></Select></Form.Item>
          <Form.Item name="is_admin" label="Администратор" valuePropName="checked"><Switch /></Form.Item>
        </>);
      case "orders":
        return (<>
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}><Select><Option value="P">Ожидает оплаты</Option><Option value="A">Оплачен</Option><Option value="C">Отменён</Option></Select></Form.Item>
          <Form.Item name="payment" label="Способ оплаты" rules={[{ required: true }]}><Select><Option value="H">При получении</Option><Option value="C">Картой</Option></Select></Form.Item>
          {orderItems.length > 0 && <Form.Item label="Товары заказа"><Table onRow={(record) => ({ onClick: () => showBookModal(books.find(b => b.id === record.book)) })} dataSource={orderItems} rowKey="id" pagination={false} size="small" columns={[{ title: "ID", dataIndex: "id", width: 50 }, { title: "Название книги", dataIndex: "book_title" }, { title: "Цена", dataIndex: "price", align: "right", render: val => `${val} ₽` }, { title: "Количество", dataIndex: "quantity", align: "right" }, { title: "Сумма", align: "right", render: (_, record) => `${record.price * record.quantity} ₽` }]} scroll={{ x: 500 }} /></Form.Item>}
        </>);
      case "bids":
        return (<>
          <Form.Item label="Аукцион"><Input value={selectedRecord?.auction?.id} disabled /></Form.Item>
          <Form.Item label="Пользователь"><Input value={selectedRecord?.user_email} disabled /></Form.Item>
          <Form.Item label="Ставка"><Input value={selectedRecord?.amount} disabled /></Form.Item>
        </>);
      default:
        return null;
    }
  };

  const columns = {
    books: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Название", dataIndex: "title", sorter: (a, b) => a.title.localeCompare(b.title), ...getColumnSearchProps('title', 'название') },
      { title: "Автор", render: (_, record) => record.authors?.map(a => a.name).join(", ") || "-", filters: [...new Set(books.flatMap(b => b.authors?.map(a => a.name) || []))].map(name => ({ text: name, value: name })), onFilter: (value, record) => record.authors?.some(a => a.name === value), filterSearch: true },
      { title: "Сдатчик", dataIndex: ["donor", "name"], filters: donors.map(d => ({ text: d.name, value: d.name })), onFilter: (value, record) => record.donor?.name === value, sorter: (a, b) => (a.donor?.name || "").localeCompare(b.donor?.name || ""), render: (_, record) => record.donor ? record.donor.name : "—" },
      { title: "Количество", dataIndex: "quantity", align: "right", sorter: (a, b) => a.quantity - b.quantity, render: val => val ?? 0 },
      { title: "Цена", dataIndex: "price", align: "right", render: val => `${val} ₽`, sorter: (a, b) => a.price - b.price },
      { title: "Состояние", dataIndex: "condition_display", filters: [{ text: 'Отличное', value: 'Отличное' }, { text: 'Хорошее', value: 'Хорошее' }, { text: 'Удовлетворительное', value: 'Удовлетворительное' }], onFilter: (value, record) => record.condition_display === value },
      { title: "Жанр", render: (_, record) => record.genres?.map(g => g.name).join(", ") || "-", filters: [...new Set(books.flatMap(b => b.genres?.map(g => g.name) || []))].map(name => ({ text: name, value: name })), onFilter: (value, record) => record.genres?.some(g => g.name === value), filterSearch: true }
    ],
    orders: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Пользователь", dataIndex: "user_email", sorter: (a, b) => a.user_email.localeCompare(b.user_email), ...getColumnSearchProps('user_email', 'email пользователя') },
      { title: "Статус", dataIndex: "status_display", filters: [{ text: 'Ожидает оплаты', value: 'Ожидает оплаты' }, { text: 'Оплачен', value: 'Оплачен' }, { text: 'Отменён', value: 'Отменён' }], onFilter: (value, record) => record.status_display === value },
      { title: "Оплата", dataIndex: "payment_display", filters: [{ text: 'При получении', value: 'При получении' }, { text: 'Картой', value: 'Картой' }], onFilter: (value, record) => record.payment_display === value },
      { title: "Сумма", dataIndex: "amount", align: "right", render: val => `${val} ₽`, sorter: (a, b) => a.amount - b.amount }
    ],
    donors: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Имя", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name), ...getColumnSearchProps('name', 'имя') },
      { title: "Телефон", dataIndex: "phone", ...getColumnSearchProps('phone', 'телефон') },
      { title: "Email", dataIndex: "email", ...getColumnSearchProps('email', 'email') }
    ],
    auctions: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Книга", dataIndex: ["product_title"], sorter: (a, b) => a.product?.title?.localeCompare(b.product?.title), ...getColumnSearchProps('product_title', 'название книги') },
      { title: "Стартовая цена", dataIndex: "starting_price", align: "right", render: val => `${val} ₽`, sorter: (a, b) => a.starting_price - b.starting_price },
      { title: "Текущая ставка", dataIndex: "current_bid", align: "right", render: val => `${val} ₽`, sorter: (a, b) => (a.current_bid || 0) - (b.current_bid || 0) },
      { title: "Статус", dataIndex: "status_display", filters: [{ text: 'Запланирован', value: 'Запланирован' }, { text: 'Активен', value: 'Активен' }, { text: 'Завершён', value: 'Завершён' }, { text: 'Отменён', value: 'Отменён' }], onFilter: (value, record) => record.status_display === value }
    ],
    bids: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Аукцион", dataIndex: ["auction"], sorter: (a, b) => a.auction?.id - b.auction?.id, ...getColumnSearchProps('auction.id', 'ID аукциона') },
      { title: "Пользователь", dataIndex: "user_email", sorter: (a, b) => a.user_email.localeCompare(b.user_email), ...getColumnSearchProps('user_email', 'email пользователя') },
      { title: "Ставка", dataIndex: "amount", align: "right", render: val => `${val} ₽`, sorter: (a, b) => a.amount - b.amount }
    ],
    users: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Email", dataIndex: "email", sorter: (a, b) => a.email.localeCompare(b.email), ...getColumnSearchProps('email', 'email') },
      { title: "Имя", dataIndex: "first_name", sorter: (a, b) => a.first_name.localeCompare(b.first_name), ...getColumnSearchProps('first_name', 'имя') },
      { title: "Фамилия", dataIndex: "last_name", sorter: (a, b) => a.last_name.localeCompare(b.last_name), ...getColumnSearchProps('last_name', 'фамилию') },
      { title: "Статус", dataIndex: "status_display", filters: [{ text: 'Активен', value: 'Активен' }, { text: 'Заблокирован', value: 'Заблокирован' }], onFilter: (value, record) => record.status_display === value },
      { title: "Админ", dataIndex: "is_admin", render: val => val ? "Да" : "Нет", filters: [{ text: 'Да', value: true }, { text: 'Нет', value: false }], onFilter: (value, record) => record.is_admin === value }
    ],
    authors: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Имя автора", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name), ...getColumnSearchProps('name', 'имя автора') }
    ],
    genres: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Название жанра", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name), ...getColumnSearchProps('name', 'название жанра') }
    ],
    publishers: [
      { title: "ID", dataIndex: "id", width: 80, sorter: (a, b) => a.id - b.id, ...getColumnSearchProps('id', 'ID') },
      { title: "Название издательства", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name), ...getColumnSearchProps('name', 'название издательства') }
    ]
  };

  const dataSourceMap = { books, orders, auctions, bids, users, authors, genres, publishers, donors };

  const getCreateButtonLabel = () => {
    if (activeTab === "references") {
      const labels = { authors: "автора", genres: "жанр", publishers: "издательство" };
      return `Добавить ${labels[referenceTab] || referenceTab}`;
    } else {
      const labels = { users: "пользователя", books: "книгу", auctions: "аукцион", donors: "сдатчика" };
      return `Добавить ${labels[activeTab] || activeTab}`;
    }
  };

    const getLabel = () => {
    if (activeTab === "references") {
      const labels = {
        authors: "автора",
        genres: "жанр",
        publishers: "издательство"
      };
      return `${labels[referenceTab] || referenceTab}`;
    } else {
      const labels = {
        users: "пользователя",
        books: "книгу",
        auctions: "аукцион",
        donors: "сдатчика"
      };
      return `${labels[activeTab] || activeTab}`;
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <Space style={{ marginBottom: 16, justifyContent: "space-between", width: "100%" }}>
        <Title level={3}>Панель администратора</Title>
      </Space>

      <Card>
        {["books", "auctions", "users", "references", "donors"].includes(activeTab) && (
          <Button 
            type="primary" 
            style={{ marginBottom: 16 }} 
            icon={<PlusOutlined />} 
            onClick={openCreate}
          >
            { getCreateButtonLabel()}
          </Button>
        )}

          
        {["books", "users", "auctions", "references", "donors"].includes(activeTab) && selectedRowKeys.length === 1 && (
          <Button icon={<EditOutlined />} style={{ marginLeft: 8 }}  onClick={() => openSelectedRecord()}>
            Изменить выбранное
          </Button>
        )}

        {["books", "users", "auctions", "references", "donors"].includes(activeTab) && selectedRowKeys.length > 0 && (
          <Button 
            danger 
            style={{ marginLeft: 8 }} 
            onClick={handleDeleteSelected}
          >
            Удалить выбранные
          </Button>
        )}
        {console.log(orders.find(o => o.id === selectedRowKeys[0]))}
        {activeTab === "orders" && selectedRowKeys.length === 1 && (
          <>
{     orders.find(o => o.id === selectedRowKeys[0]).status === "P" &&       <Button
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={() => {
                const order = orders.find(o => o.id === selectedRowKeys[0]);
                if (!order) return;
                Modal.confirm({
                  title: "Подтвердить оплату?",
                  content: `Вы действительно хотите подтвердить оплату заказа №${order.id}?`,
                  okText: "Да",
                  cancelText: "Нет",
                  onOk: () => handleUpdateOrderStatus(order.id, "A"),
                });
              }}
            >
              Подтвердить оплату
            </Button>
}
{   orders.find(o => o.id === selectedRowKeys[0]).status != "C" &&           <Button
              danger
              style={{ marginLeft: 8 }}
              onClick={() => {
                const order = orders.find(o => o.id === selectedRowKeys[0]);
                if (!order) return;
                Modal.confirm({
                  title: "Отменить заказ?",
                  content: `Отменить заказ №${order.id}? Книги вернутся на склад.`,
                  okText: "Да",
                  cancelText: "Нет",
                  onOk: () => handleUpdateOrderStatus(order.id, "C"),
                });
              }}
            >
              Отменить заказ
            </Button>}
          </>
        )}

        <Tabs
          activeKey={activeTab}
          onChange={key => {
            setActiveTab(key);
            setSearchText("");
            setSearchedColumn("");
            setSelectedRowKeys([]); 
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
              rowSelection={rowSelection}
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
              rowSelection={{
                type: "radio",
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
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
              rowSelection={rowSelection}
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
              rowSelection={rowSelection}
            />
          </TabPane>
          <TabPane tab="Сдатчики" key="donors">
            <Table 
              dataSource={donors} 
              columns={columns.donors} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowSelection={rowSelection}
            />
          </TabPane>
          <TabPane tab="Справочники" key="references">
            <Tabs
              activeKey={referenceTab}
              onChange={key => setReferenceTab(key)}
              type="card"
            >
              <TabPane tab="Авторы" key="authors">
                <Table 
                  dataSource={authors} 
                  columns={columns.authors} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  rowSelection={rowSelection}
                />
              </TabPane>
              <TabPane tab="Жанры" key="genres">
                <Table 
                  dataSource={genres} 
                  columns={columns.genres} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  rowSelection={rowSelection}
                />
              </TabPane>
              <TabPane tab="Издательства" key="publishers">
                <Table 
                  dataSource={publishers} 
                  columns={columns.publishers} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  rowSelection={rowSelection}
                />
              </TabPane>
            </Tabs>
          </TabPane>

        </Tabs>
      </Card>

      <Drawer
        title={creating ? `Создать ${getLabel(activeTab)}` : `Редактировать ${getLabel(activeTab)}`}
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
      <Modal
  title={selectedBook?.title}
  open={isModalVisible}
  onCancel={handleCloseModal}
  footer={[
    <Button key="close" onClick={handleCloseModal}>
      Закрыть
    </Button>,
  ]}
  width={700}
>
  {selectedBook && (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: "0 0 200px" }}>
        {selectedBook.photo ? (
          <img
            src={selectedBook.photo}
            alt={selectedBook.title}
            style={{ width: "100%", borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 250,
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
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
  )}
</Modal>

    </div>
  );
};

export default DashboardContent;