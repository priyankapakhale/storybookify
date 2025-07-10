import React from "react";

type ProfileCardProps = {
  name: string;
  role: string;
  avatarUrl: string;
};

export const ProfileCard = ({ name, role, avatarUrl }: ProfileCardProps) => {
  return (
    <div
      style={{
        maxWidth: "300px",
        margin: "auto",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        style={{
          height: "64px",
          width: "64px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #ccc",
        }}
      />
      <div>
        <div style={{ fontSize: "18px", fontWeight: "600", color: "#222" }}>
          {name}
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>{role}</div>
      </div>
    </div>
  );
};
