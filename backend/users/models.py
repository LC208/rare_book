from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator


class CustomUserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None, status=1, is_admin=False):
        if not email:
            raise ValueError("Email обязателен")
        if not password or len(password) < 8:
            raise ValueError("Пароль обязателен и должен содержать минимум 8 символов")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            status=status,
            is_admin=is_admin
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password):
        user = self.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            status=1,
            is_admin=True
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    STATUS_CHOICES = (
        (1, "Активен"),
        (2, "Заблокирован"),
    )

    email = models.EmailField(
        unique=True,
        max_length=50,
        verbose_name="Электронная почта"
    )
    first_name = models.CharField(
        max_length=50,
        verbose_name="Имя",
        validators=[RegexValidator(r'^[A-Za-zА-Яа-яёЁ]+$', message="Имя должно содержать только буквы")]
    )
    last_name = models.CharField(
        max_length=50,
        verbose_name="Фамилия",
        validators=[RegexValidator(r'^[A-Za-zА-Яа-яёЁ]+$', message="Фамилия должна содержать только буквы")]
    )
    password = models.CharField(
        max_length=64,
        validators=[MinLengthValidator(8)],
        verbose_name="Пароль"
    )
    status = models.PositiveSmallIntegerField(
        choices=STATUS_CHOICES,
        default=1,
        verbose_name="Статус пользователя"
    )
    is_admin = models.BooleanField(default=False, verbose_name="Администратор")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    @property
    def status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, "Неизвестно")