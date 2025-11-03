import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select, DatePicker, Button, Table, Space, message } from "antd";
import axios from "../utils/axios";
import dayjs from "dayjs";
import { DownloadOutlined } from "@ant-design/icons";

const { RangePicker } = DatePicker;
const { Option } = Select;

const SalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [filters, setFilters] = useState({
    authors: [],   // <-- plural
    genres: [],    // <-- plural
    publisher: null,
    book_status: null,    // совпадает с бэком
    book_condition: null, // совпадает с бэком
    dateRange: [],
    price_min: null,
    price_max: null,
  });

  const statusOptions = [
    { value: 1, label: "К продаже" },
    { value: 2, label: "Продано" },
    { value: 3, label: "На аукционе" },
    { value: 4, label: "Заблокировано" }
  ];

  const conditionOptions = [
    { value: 1, label: "Отличное" },
    { value: 2, label: "Хорошее" },
    { value: 3, label: "Удовлетворительное" }
  ];

  const fetchFilters = async () => {
    try {
      const [authorsRes, genresRes, publishersRes] = await Promise.all([
        axios.get("books/authors"),
        axios.get("books/genres"),
        axios.get("books/publishers"),
      ]);
      setAuthors(authorsRes.data);
      setGenres(genresRes.data);
      setPublishers(publishersRes.data);
    } catch (err) {
      message.error("Ошибка при загрузке фильтров");
    }
  };

const fetchOrders = async () => {
  try {
    const params = {};

    if (filters.authors && filters.authors.length) params['authors'] = filters.authors.join(',');
    if (filters.genres && filters.genres.length) params['genres'] = filters.genres.join(',');
    if (filters.publisher) params['publisher'] = filters.publisher;
    if (filters.book_status) params['book_status'] = filters.book_status;
    if (filters.book_condition) params['book_condition'] = filters.book_condition;

    if (Array.isArray(filters.dateRange) && filters.dateRange.length === 2) {
      params['date_after'] = filters.dateRange[0].format("YYYY-MM-DD");
      params['date_before'] = filters.dateRange[1].format("YYYY-MM-DD");
    }

    const res = await axios.get("orders/report/items/", { params });
    // Ожидаем { analytics, items }
    setAnalytics(res.data.analytics || null);
    setOrders(res.data.items || []);
  } catch (err) {
    message.error("Ошибка при загрузке данных отчёта");
  }
};

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleFilterChange = (key, value) => {
    // RangePicker может вернуть null
    setFilters(prev => ({ ...prev, [key]: value ?? (Array.isArray(prev[key]) ? [] : null) }));
  };

const handleExportCSV = () => {
  if (!orders.length && !analytics) return;

  // Сначала собираем блок аналитики (несколько строк)
  const analyticsRows = [];
  if (analytics) {
    analyticsRows.push(["Общая аналитика"]);
    analyticsRows.push(["Продано (экз.)", analytics.total_sold_count]);
    analyticsRows.push(["Общая сумма продаж", analytics.total_sales_amount]);
    analyticsRows.push(["Средняя цена", analytics.average_price]);
    if (analytics.period && analytics.period.start) {
      analyticsRows.push(["Период", `${analytics.period.start} - ${analytics.period.end}`]);
      analyticsRows.push(["Сумма за период", analytics.period.total]);
      analyticsRows.push(["Средняя за период", analytics.period.avg]);
    }
    // Пустая строка-разделитель
    analyticsRows.push([]);
    // Продажи по жанрам (несколько строк)
    if (analytics.by_genres && analytics.by_genres.length) {
      analyticsRows.push(["Продажи по жанрам"]);
      analyticsRows.push(["Жанр","Кол-во","Сумма","Средняя цена"]);
      analytics.by_genres.forEach(g => analyticsRows.push([g.name, g.count, g.total, g.avg]));
      analyticsRows.push([]);
    }
    // По авторам (короткий список)
    if (analytics.by_authors && analytics.by_authors.length) {
      analyticsRows.push(["Продажи по авторам"]);
      analyticsRows.push(["Автор","Кол-во","Сумма","Средняя цена"]);
      analytics.by_authors.slice(0,50).forEach(a => analyticsRows.push([a.name, a.count, a.total, a.avg])); // лимит 50
      analyticsRows.push([]);
    }
    // По состояниям/статусам
    if (analytics.by_condition && analytics.by_condition.length) {
      analyticsRows.push(["Продажи по состояниям"]);
      analyticsRows.push(["Состояние","Кол-во","Сумма","Средняя цена"]);
      analytics.by_condition.forEach(c => analyticsRows.push([c.label, c.count, c.total, c.avg]));
      analyticsRows.push([]);
    }
    if (analytics.by_status && analytics.by_status.length) {
      analyticsRows.push(["Продажи по видам (статус книги)"]);
      analyticsRows.push(["Вид","Кол-во","Сумма","Средняя цена"]);
      analytics.by_status.forEach(s => analyticsRows.push([s.label, s.count, s.total, s.avg]));
      analyticsRows.push([]);
    }
  }

  // Заголовок таблицы позиций
  const header = [
    "Дата", "Покупатель", "Книга", "Цена",
    "Автор(ы)", "Жанры", "Издатель",
    "Состояние книги", "Статус книги", "Статус заказа", "Оплата"
  ];

  const rows = orders.map(item => {
    const book = item.book || {};
    return [
      item.order_date,
      item.user?.username || "N/A",
      book.title || "N/A",
      item.price,
      book.authors_list || "",
      book.genres_list || "",
      book.publisher?.name || "",
      book.condition_display || "",
      book.status_display || "",
      item.order_status || "",
      item.payment_display || ""
    ];
  });

  // Собираем всё вместе: analyticsRows (массив массивов) + header + rows
  const allRows = [
    ...analyticsRows,
    header,
    ...rows
  ];

  const csvContent = allRows.map(r =>
    r.map(cell => {
      if (cell == null || cell === undefined) return '';
      const s = String(cell).replace(/"/g, '""');
      return `"${s}"`;
    }).join(',')
  ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `sales_report_${dayjs().format("YYYYMMDD")}.csv`;
  link.click();
};

  const columns = [
    { title: "Дата заказа", dataIndex: "order_date", key: "order_date" },
    {
      title: "Покупатель",
      dataIndex: ["user","username"],
      key: "user",
      render: (_, r) => r.user?.username || "N/A"
    },
    {
      title: "Книга",
      dataIndex: ["book","title"],
      key: "book",
      render: (_, r) => r.book?.title || "N/A"
    },
    { title: "Автор(ы)", dataIndex: ["book","authors_list"], key: "authors" },
    { title: "Жанры", dataIndex: ["book","genres_list"], key: "genres" },
    { title: "Издатель", dataIndex: ["book","publisher","name"], key: "publisher", render: (_, r) => r.book?.publisher?.name || "N/A" },
    { title: "Цена", dataIndex: "price", key: "price" },
    { title: "Статус заказа", dataIndex: "order_status", key: "order_status" },
    { title: "Оплата", dataIndex: "payment_display", key: "payment" },
  ];

  return (
    <div style={{ padding: 24 }}>

                {analytics && (
            <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={24} md={6}>
                <Card size="small" title="Продано (экз.)">
                    <b>{analytics.total_sold_count}</b>
                </Card>
                </Col>
                <Col xs={24} sm={24} md={6}>
                <Card size="small" title="Общая сумма продаж">
                    <b>{analytics.total_sales_amount.toFixed(2)}</b>
                </Card>
                </Col>
                <Col xs={24} sm={24} md={6}>
                <Card size="small" title="Средняя цена">
                    <b>{analytics.average_price ? analytics.average_price.toFixed(2) : "0.00"}</b>
                </Card>
                </Col>
                <Col xs={24} sm={24} md={6}>
                <Card size="small" title="За период">
                    <b>{analytics.period?.total != null ? analytics.period.total.toFixed(2) : "0.00"}</b>
                </Card>
                </Col>
            </Row>
        )}

      <Row gutter={[16,16]}>
        <Col xs={24} sm={24} md={6}>
          <Card title="Фильтры">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Select
                mode="multiple"
                placeholder="Автор(ы)"
                allowClear
                onChange={v => handleFilterChange("authors", v)}
                style={{ width: "100%" }}
                value={filters.authors}
              >
                {authors.map(a => (
                  <Option key={a.id} value={a.id}>{a.name}</Option>
                ))}
              </Select>

              <Select
                mode="multiple"
                placeholder="Жанры"
                allowClear
                onChange={v => handleFilterChange("genres", v)}
                style={{ width: "100%" }}
                value={filters.genres}
              >
                {genres.map(g => (
                  <Option key={g.id} value={g.id}>{g.name}</Option>
                ))}
              </Select>

              <Select
                placeholder="Издатель"
                allowClear
                onChange={v => handleFilterChange("publisher", v)}
                style={{ width: "100%" }}
                value={filters.publisher}
              >
                {publishers.map(p => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>

              <Select
                placeholder="Статус книги"
                allowClear
                onChange={v => handleFilterChange("book_status", v)}
                style={{ width: "100%" }}
                value={filters.book_status}
              >
                {statusOptions.map(s => (
                  <Option key={s.value} value={s.value}>{s.label}</Option>
                ))}
              </Select>

              <Select
                placeholder="Состояние книги"
                allowClear
                onChange={v => handleFilterChange("book_condition", v)}
                style={{ width: "100%" }}
                value={filters.book_condition}
              >
                {conditionOptions.map(c => (
                  <Option key={c.value} value={c.value}>{c.label}</Option>
                ))}
              </Select>

              <RangePicker
                onChange={dates => handleFilterChange("dateRange", dates)}
                style={{ width: "100%" }}
                value={filters.dateRange}
              />

              <Button type="primary" onClick={fetchOrders} block>Применить</Button>
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV} block>Экспорт CSV</Button>
            </Space>
          </Card>
        </Col>


        <Col xs={24} sm={24} md={18}>
          <Table rowKey="id" columns={columns} dataSource={orders} />
        </Col>



      </Row>
    </div>
  );
};

export default SalesReport;
