import React, { useState } from "react";
import { Form, Input, Button, Row, Col } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../hooks/useAuth";

const RegisterForm = () => {
  const [errorFields, setErrorFields] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      password: values.password,
    };

    try {
      const response = await axios.post("users/register/", payload, { withCredentials: true });
      const accessToken = response.data.access;
      if (accessToken) {
        login(accessToken);
        navigate("/profile");
      }
    } catch (err) {
      if (err.response?.data) {
        const fields = Object.keys(err.response.data).map((key) => ({
          name: key,
          errors: Array.isArray(err.response.data[key])
            ? err.response.data[key]
            : [err.response.data[key]],
        }));
        setErrorFields(fields);
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>Регистрация</h2>
      <Form layout="vertical" onFinish={handleSubmit} fields={errorFields}>
        <Form.Item
          name="first_name"
          label="Имя"
          rules={[{ required: true, message: "Введите имя" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="last_name"
          label="Фамилия"
          rules={[{ required: true, message: "Введите фамилию" }]}
        >
          <Input />
        </Form.Item>
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
          rules={[
            { required: true, message: "Введите пароль" },
            { min: 8, message: "Пароль должен быть не менее 8 символов" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Зарегистрироваться
          </Button>
        </Form.Item>

        <Row justify="space-between">
          <Col>
            <Link style={{ color: '#DE7625' }} to="/login">Уже есть аккаунт?Войти.</Link>
          </Col>
          <Col>
            {/* можно добавить ссылку на "Политика конфиденциальности" или оставить пусто */}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default RegisterForm;
