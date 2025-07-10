import React from "react";

type Status = "active" | "inactive" | "pending";

type StatusBadgeProps = {
  status: Status;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span>Status: {status}</span>;
};
