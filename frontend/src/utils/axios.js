import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true, // обязательно, чтобы куки (refresh token) передавались
});

// Добавляем access token к каждому запросу
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответов: если 401 → пробуем обновить токен
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        // запрос на обновление токена
        const refreshResponse = await axios.post(
          "http://localhost:8000/users/refresh/",
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // повторяем запрос с новым токеном
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(error.config);
      } catch (refreshError) {
        console.error("Ошибка при обновлении токена", refreshError);
        // Тут можно вызвать logout()
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;