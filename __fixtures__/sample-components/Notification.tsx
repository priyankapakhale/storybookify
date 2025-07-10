import React from "react";

type NotificationProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
};

const getStyle = (type: string) => {
  switch (type) {
    case "success":
      return {
        backgroundColor: "#e6ffed",
        color: "#2e7d32",
        borderColor: "#81c784",
      };
    case "error":
      return {
        backgroundColor: "#ffebee",
        color: "#c62828",
        borderColor: "#ef5350",
      };
    case "info":
    default:
      return {
        backgroundColor: "#e3f2fd",
        color: "#1565c0",
        borderColor: "#64b5f6",
      };
  }
};

export const Notification = ({
  message,
  type = "info",
  onClose,
}: NotificationProps) => {
  const style = getStyle(type);

  return (
    <div
      style={{
        border: `1px solid ${style.borderColor}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
        padding: "12px 16px",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginLeft: "12px",
            fontSize: "14px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#555",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
