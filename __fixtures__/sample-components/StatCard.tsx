import React from "react";

type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "280px",
      }}
    >
      {icon && <div style={{ fontSize: "24px", color: "#4f46e5" }}>{icon}</div>}
      <div>
        <div style={{ fontSize: "14px", color: "#666" }}>{label}</div>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111" }}>
          {value}
        </div>
      </div>
    </div>
  );
};
