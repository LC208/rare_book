import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Slider,
  Button,
  Spin,
  message,
  Tag,
  Space,
  Pagination,
  Empty,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";

const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    title: "",
    authors: [],
    genres: [],
    status: [1], // По умолчанию показываем только книги "К продаже"
    condition: [],
    publisher: [],
    priceRange: [0, 100000],
    ordering: "title",
  });

  const STATUS_CHOICES = {
    1: "К продаже",
    2: "Продано",
    3: "На аукционе",
    4: "Заблокировано",
  };

  const CONDITION_CHOICES = {
    1: "Отличное",
    2: "Хорошее",
    3: "Удовлетворительное",
  };

  const STATUS_COLORS = {
    1: "green",
    2: "red",
    3: "blue",
    4: "gray",
  };

  const CONDITION_COLORS = {
    1: "green",
    2: "blue",
    3: "orange",
  };

  // Загрузка данных фильтров при монтировании
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Загрузка книг при изменении фильтров или страницы
  useEffect(() => {
    fetchBooks();
  }, [filters, currentPage, pageSize]);


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

  const fetchFilterOptions = async () => {
    try {
      fetchData("books/authors", setAuthors);
      fetchData("books/genres", setGenres);
      fetchData("books/publishers", setPublishers);
    } catch (err) {
      message.error("Ошибка загрузки фильтров");
      console.error(err);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.title) params.append("search", filters.title);
      if (filters.authors.length > 0) params.append("authors", filters.authors.join(","));
      if (filters.genres.length > 0) params.append("genres", filters.genres.join(","));
      if (filters.status.length > 0) params.append("status", filters.status.join(","));
      if (filters.condition.length > 0) params.append("condition", filters.condition.join(","));
      if (filters.publisher.length > 0) params.append("publisher", filters.publisher.join(","));

      params.append("ordering", filters.ordering);
      params.append("limit", pageSize);
      params.append("offset", (currentPage - 1) * pageSize);

      fetchData("books/", setBooks);
      setTotal(setBooks.length+1);
    } catch (err) {
      message.error("Ошибка загрузки книг");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      title: "",
      authors: [],
      genres: [],
      status: [1],
      condition: [],
      publisher: [],
      priceRange: [0, 100000],
      ordering: "title",
    });
    setCurrentPage(1);
  };

  const handleAddToCart = (book) => {
    message.success(`"${book.title}" добавлена в корзину`);
    // Здесь можно добавить логику для добавления в корзину
  };

  const BookCard = ({ book }) => (
    <Card
      hoverable
      cover={
        book.photo ? (
          <img
            alt={book.title}
            src={book.photo}
            style={{ height: 250, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: 250,
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: 12,
            }}
          >
            Нет изображения
          </div>
        )
      }
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600, marginTop: 0 }}>
          {book.title}
        </h3>
        <p style={{ color: "#666", marginBottom: 8, fontSize: 12 }}>
          {book.authors_list || "Автор неизвестен"}
        </p>
        <div style={{ marginBottom: 8 }}>
          <Tag color={STATUS_COLORS[book.status]}>
            {STATUS_CHOICES[book.status] || "Неизвестно"}
          </Tag>
          <Tag color={CONDITION_COLORS[book.condition]}>
            {CONDITION_CHOICES[book.condition] || "Неизвестно"}
          </Tag>
        </div>
        <p style={{ marginBottom: 8, fontSize: 12 }}>
          <strong>Жанры:</strong> {book.genres_list || "-"}
        </p>
        <p style={{ marginBottom: 8, fontSize: 12 }}>
          <strong>Издатель:</strong> {book.publisher?.name || "-"}
        </p>
        <p style={{ marginBottom: 8, fontSize: 12 }}>
          <strong>Год:</strong> {book.year}
        </p>
      </div>

      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          paddingTop: 12,
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1890ff" }}>
            {book.price} ₽
          </span>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            size="small"
            disabled={book.status !== 1}
            onClick={() => handleAddToCart(book)}
          >
            В корзину
          </Button>
        </div>
      </div>
    </Card>
  );

  const filterContent = (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Поиск по названию
        </label>
        <Input
          placeholder="Введите название или описание"
          value={filters.title}
          onChange={(e) => handleFilterChange("title", e.target.value)}
          allowClear
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Авторы
        </label>
        <Select
          mode="multiple"
          placeholder="Выберите авторов"
          value={filters.authors}
          onChange={(value) => handleFilterChange("authors", value)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          style={{ width: "100%" }}
        >
          {authors.map((author) => (
            <Select.Option key={author.id} value={author.id}>
              {author.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Жанры
        </label>
        <Select
          mode="multiple"
          placeholder="Выберите жанры"
          value={filters.genres}
          onChange={(value) => handleFilterChange("genres", value)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          style={{ width: "100%" }}
        >
          {genres.map((genre) => (
            <Select.Option key={genre.id} value={genre.id}>
              {genre.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Издатель
        </label>
        <Select
          mode="multiple"
          placeholder="Выберите издателя"
          value={filters.publisher}
          onChange={(value) => handleFilterChange("publisher", value)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          style={{ width: "100%" }}
        >
          {publishers.map((publisher) => (
            <Select.Option key={publisher.id} value={publisher.id}>
              {publisher.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Состояние
        </label>
        <Select
          mode="multiple"
          placeholder="Выберите состояние"
          value={filters.condition}
          onChange={(value) => handleFilterChange("condition", value)}
          style={{ width: "100%" }}
        >
          {Object.entries(CONDITION_CHOICES).map(([key, value]) => (
            <Select.Option key={key} value={Number(key)}>
              {value}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Цена: {filters.priceRange[0]} ₽ - {filters.priceRange[1]} ₽
        </label>
        <Slider
          range
          min={0}
          max={100000}
          step={1000}
          value={filters.priceRange}
          onChange={(value) => handleFilterChange("priceRange", value)}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Сортировка
        </label>
        <Select
          value={filters.ordering}
          onChange={(value) => handleFilterChange("ordering", value)}
          style={{ width: "100%" }}
        >
          <Select.Option value="title">По названию (A-Z)</Select.Option>
          <Select.Option value="-title">По названию (Z-A)</Select.Option>
          <Select.Option value="price">По цене (низкая первая)</Select.Option>
          <Select.Option value="-price">По цене (высокая первая)</Select.Option>
          <Select.Option value="year">По году (старые первые)</Select.Option>
          <Select.Option value="-year">По году (новые первые)</Select.Option>
        </Select>
      </div>

      <Button
        type="primary"
        icon={<ClearOutlined />}
        onClick={handleReset}
        block
      >
        Сбросить фильтры
      </Button>
    </Space>
  );

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 24 }}>Главная</h1>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={6}>
            <Card title="Фильтры" style={{ position: "sticky", top: 20 }}>
              {filterContent}
            </Card>
          </Col>

          <Col xs={24} sm={24} md={18}>
            <Spin spinning={loading}>
              {books.length > 0 ? (
                <>
                  <div style={{ marginBottom: 16, padding: "0 12px" }}>
                    <p style={{ color: "#666" }}>
                      Найдено книг: <strong>{total}</strong>
                    </p>
                  </div>

                  <Row gutter={[16, 16]}>
                    {books.map((book) => (
                      <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                        <BookCard book={book} />
                      </Col>
                    ))}
                  </Row>

                  <div style={{ marginTop: 24, textAlign: "center" }}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={total}
                      pageSizeOptions={[12, 24, 36, 48]}
                      showSizeChanger
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} из ${total}`
                      }
                      onChange={(page) => setCurrentPage(page)}
                      onShowSizeChange={(current, size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </>
              ) : (
                <Empty 
                  description="Книги не найдены" 
                  style={{ marginTop: 100 }}
                />
              )}
            </Spin>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookSearch;