from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken


class UserTests(APITestCase):

    def setUp(self):
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.profile_url = reverse("profile")
        self.refresh_url = reverse("token_refresh")
        self.user_data = {
            "email": "user@mail.ru",
            "first_name": "Иван",
            "last_name": "Иванов",
            "password": "securePass123",
        }
        self.user = CustomUser.objects.create_user(**self.user_data)
        self.refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(self.refresh)
        self.access_token = str(self.refresh.access_token)

    def test_register_existing_email(self):
        """Email уже зарегистрирован"""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_with_empty_fields(self):
        """Пустые поля регистрации"""
        response = self.client.post(
            self.register_url,
            {
                "email": "new@mail.ru",
                "first_name": "",
                "last_name": "",
                "password": "pass12345",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_valid_data(self):
        """Корректная регистрация"""
        response = self.client.post(
            self.register_url,
            {
                "email": "newuser@mail.ru",
                "first_name": "Анна",
                "last_name": "Иванова",
                "password": "pass12345",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_invalid_email_format(self):
        """Неверный формат Email"""
        response = self.client.post(
            self.register_url,
            {
                "email": "invalid@@mail",
                "first_name": "Андрей",
                "last_name": "Петров",
                "password": "pass12345",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_user(self):
        """Вход: email не существует"""
        response = self.client.post(
            self.login_url, {"email": "ghost@mail.ru", "password": "whatever"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_wrong_password(self):
        """Вход: неверный пароль"""
        response = self.client.post(
            self.login_url, {"email": self.user_data["email"], "password": "wrongpass"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """Успешная авторизация"""
        response = self.client.post(
            self.login_url,
            {"email": self.user_data["email"], "password": self.user_data["password"]},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_profile_access_without_auth(self):
        """Попытка получить профиль без авторизации"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_access_with_token(self):
        """Получение профиля с токеном"""
        login = self.client.post(
            self.login_url,
            {"email": self.user_data["email"], "password": self.user_data["password"]},
        )
        token = login.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user_data["email"])

    def test_refresh_token_success(self):
        """Успешное обновление токена"""
        response = self.client.post(self.refresh_url, {"refresh": self.refresh_token})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_refresh_token_invalid(self):
        """Обновление с невалидным токеном"""
        response = self.client.post(self.refresh_url, {"refresh": "invalidtoken123"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)
