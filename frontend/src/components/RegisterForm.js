import React, { useState } from "react";
import { Form, Input, Button, Row, Col, Progress } from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import { useAuth } from "../hooks/useAuth";
import zxcvbn from "zxcvbn";

const PASSWORD_BLACKLIST = ["12345678", "password", "qwerty"];

const RegisterForm = () => {
  const [errorFields, setErrorFields] = useState([]);
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordText, setPasswordText] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordText(value);
    const result = zxcvbn(value);
    setPasswordScore(result.score);
  };

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

  const validatePassword = (_, value) => {
    if (!value) return Promise.reject(new Error("Введите пароль"));
    if (value.length < 8) return Promise.reject(new Error("Пароль должен быть не менее 8 символов"));
    if (value.includes(" ")) return Promise.reject(new Error("Пароль не должен содержать пробелы"));
    if (PASSWORD_BLACKLIST.includes(value)) return Promise.reject(new Error("Пароль слишком простой"));
    const strength = zxcvbn(value);
    if (strength.score < 2) return Promise.reject(new Error("Пароль слишком простой, используйте более сложный"));
    return Promise.resolve();
  };

  const validateName = (_, value) => {
    if (!value) return Promise.reject(new Error("Поле обязательно"));
    if (value.length > 50) return Promise.reject(new Error("Слишком длинное имя/фамилия (максимум 50 символов)"));
    if (/[^а-яА-ЯёЁa-zA-Z\-]/.test(value)) return Promise.reject(new Error("Недопустимые символы, только буквы и дефис"));
    return Promise.resolve();
  };

  const validateEmail = (_, value) => {
    if (!value) return Promise.reject(new Error("Введите email"));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return Promise.reject(new Error("Некорректный формат email"));
    return Promise.resolve();
  };

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

  const passwordStatus = getPasswordStatus();

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>Регистрация</h2>
      <Form layout="vertical" onFinish={handleSubmit} fields={errorFields}>
        <Form.Item
          name="first_name"
          label="Имя"
          rules={[{ validator: validateName }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="last_name"
          label="Фамилия"
          rules={[{ validator: validateName }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Почта"
          rules={[{ validator: validateEmail }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ validator: validatePassword }]}
        >
          <Input.Password onChange={handlePasswordChange} />
        </Form.Item>

        {/* Показываем ProgressBar только если есть текст в поле пароля */}
        {passwordText && (
          <Progress
            percent={(passwordScore + 1) * 20}
            status={passwordStatus.status}
            showInfo={true}
            format={() => passwordStatus.text}
          />
        )}

        <Form.Item style={{ marginTop: 10 }}>
          <Button type="primary" htmlType="submit" block>
            Зарегистрироваться
          </Button>
        </Form.Item>

        <Row justify="space-between">
          <Col>
            <Link style={{ color: '#DE7625' }} to="/login">Уже есть аккаунт? Войти.</Link>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default RegisterForm;
