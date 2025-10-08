import React from "react";
import { Spin, Result, Button } from "antd";
import { useAuth } from "../hooks/useAuth";
import DashboardContent from "./DashboardContent"; // вынесем основной код

const AdminDashboard = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <Spin fullscreen />;

  if (!user?.is_staff) {
    return (
      <Result
        status="403"
        title="Доступ запрещён"
        subTitle="У вас нет прав для просмотра панели администратора"
        extra={
          <Button type="primary" onClick={() => window.location.href = "/"}>
            На главную
          </Button>
        }
      />
    );
  }

  return <DashboardContent logout={logout} />;
};

export default AdminDashboard;
