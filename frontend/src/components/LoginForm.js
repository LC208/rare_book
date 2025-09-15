import React, { useState } from "react";
import { Form, Input, Button, Row, Col, notification } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../hooks/useAuth";

const LoginForm = () => {
  const [errorFields, setErrorFields] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post("users/login/", values, { withCredentials: true });
      const accessToken = response.data.access;
      login(accessToken);
      navigate("/profile");
    } catch (err) {
      // Если сервер вернул ошибки полей
      if (err.response?.data) {
        const fields = Object.keys(err.response.data).map((key) => ({
          name: key,
          errors: Array.isArray(err.response.data[key])
            ? err.response.data[key]
            : [err.response.data[key]],
        }));
        setErrorFields(fields);
      }
      // Показываем уведомление
      notification.error({
        message: "Ошибка входа",
        description: err.response?.data?.detail || "Неверный email или пароль",
        placement: "topRight",
      });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>Вход</h2>
      <Form layout="vertical" onFinish={handleSubmit} fields={errorFields}>
        <Form.Item
          name="email"
          label="Почта"
          rules={[
            { required: true, type: "email", message: "Введите корректный email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ required: true, message: "Введите пароль" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Войти
          </Button>
        </Form.Item>

        {/* Ссылки под кнопкой по краям */}
        <Row justify="space-between">
          <Col>
            <a style={{ color: '#DE7625' }} href="#">Забыли пароль?</a>
          </Col>
          <Col>
            <Link style={{ color: '#DE7625' }} to="/register">Регистрация</Link>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default LoginForm;
