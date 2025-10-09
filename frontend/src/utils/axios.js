import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  withCredentials: true, // обязательно, чтобы refresh в куке работал
});

// Добавляем access token к каждому запросу
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && !config.url.includes("users/refresh/")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик ответов: если 401 → пробуем обновить токен
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // обновляем access token
        const refreshResponse = await axiosInstance.post("users/refresh/", {});
        const newAccessToken = refreshResponse.data.access;

        // сохраняем новый токен
        localStorage.setItem("accessToken", newAccessToken);

        // обновляем заголовок и повторяем запрос
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Ошибка при обновлении токена", refreshError);

        // удаляем токен и редиректим на логин
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // либо вызвать logout() из useAuth
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
