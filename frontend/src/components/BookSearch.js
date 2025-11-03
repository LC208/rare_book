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
  InputNumber
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { addToCart } from "../utils/cart";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Modal } from "antd";



const BookSearch = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [total, setTotal] = useState(0);
  const { isAuthenticated } = useAuth();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const showBookModal = (book) => {
    setSelectedBook(book);
    setIsModalVisible(true);
  };


  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBook(null);
  };


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
    const params = {};

    if (filters.title) params.search = filters.title;
    if (filters.authors.length > 0) params.authors = filters.authors.join(",");
    if (filters.genres.length > 0) params.genres = filters.genres.join(",");
    if (filters.status.length > 0) params.status = filters.status.join(",");
    if (filters.condition.length > 0) params.condition = filters.condition.join(",");
    if (filters.publisher.length > 0) params.publisher = filters.publisher.join(",");
    if (filters.priceRange && filters.priceRange.length === 2) {
        params.min_price = filters.priceRange[0]; // нижняя граница
        params.max_price = filters.priceRange[1]; // верхняя граница
    }
    params.ordering = filters.ordering;
    params.page = currentPage;
    params.page_size = pageSize;

    const res = await axios.get("books/", { params });
    setBooks(res.data.results || res.data);
    setTotal(res.data.count || res.data.length || 0);
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


  const BookCard = ({ book }) => (
    <Card
      hoverable
      onClick={() => showBookModal(book)}
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
        <p style={{ marginBottom: 8, fontSize: 12 }}>
          <strong>Доступно:</strong> {book.quantity} шт.
        </p>

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
                Цена
            </label>
            <Space>
                <Input
                type="number"
                placeholder="от"
                value={filters.priceRange[0]}
                onChange={(e) =>
                    handleFilterChange("priceRange", [
                    Number(e.target.value),
                    filters.priceRange[1],
                    ])
                }
                style={{ width: 100 }}
                />
                <Input
                type="number"
                placeholder="до"
                value={filters.priceRange[1]}
                onChange={(e) =>
                    handleFilterChange("priceRange", [
                    filters.priceRange[0],
                    Number(e.target.value),
                    ])
                }
                style={{ width: 100 }}
                />
            </Space>
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
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: 24 
        }}>
          <h1 style={{ margin: 0 }}>Главная</h1>
          
          {isAuthenticated && (
            <Link to="/cart">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
              >
                Корзина
              </Button>
            </Link>
          )}
        </div>
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
                      pageSizeOptions={[4, 8, 12 ,24, 36, 48]}
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
        <Modal
  title={selectedBook?.title}
  open={isModalVisible}
  onCancel={handleCloseModal}
  footer={[
isAuthenticated && selectedBook && selectedBook.status === 1 && selectedBook.quantity > 0 && (
          <InputNumber
            min={1}
            max={selectedBook.quantity}
            defaultValue={1}
            value={quantityToAdd}
            onChange={setQuantityToAdd}
          />
      )
    ,
    isAuthenticated && selectedBook && selectedBook.status === 1 && selectedBook.quantity > 0 && <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              addToCart(selectedBook, quantityToAdd);
              handleCloseModal();
            }}
          >
            Добавить в корзину
          </Button>
    ,
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
        <p><strong>Авторы:</strong> {selectedBook.authors_list || "Неизвестно"}</p>
        <p><strong>Жанры:</strong> {selectedBook.genres_list || "—"}</p>
        <p><strong>Издательство:</strong> {selectedBook.publisher?.name || "—"}</p>
        <p><strong>Год:</strong> {selectedBook.year}</p>
        <p>
          <strong>Состояние:</strong>{" "}
          <Tag color={CONDITION_COLORS[selectedBook.condition]}>
            {CONDITION_CHOICES[selectedBook.condition]}
          </Tag>
        </p>
        <p>
          <strong>Статус:</strong>{" "}
          <Tag color={STATUS_COLORS[selectedBook.status]}>
            {STATUS_CHOICES[selectedBook.status]}
          </Tag>
        </p>
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
    </div>
  );
};

export default BookSearch;