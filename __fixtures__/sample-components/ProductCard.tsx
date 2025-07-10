import React from "react";

type ProductCardProps = {
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  inStock: boolean;
  onAddToCart: () => void;
};

export const ProductCard = ({
  title,
  description,
  price,
  imageUrl,
  rating,
  inStock,
  onAddToCart,
}: ProductCardProps) => {
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        width: "300px",
        fontFamily: "sans-serif",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          borderRadius: "4px",
        }}
      />
      <h2 style={{ fontSize: "18px", margin: "12px 0 6px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#666" }}>{description}</p>
      <div style={{ margin: "10px 0", fontSize: "16px", fontWeight: "bold" }}>
        ₹{price.toFixed(2)}
      </div>
      <div style={{ fontSize: "14px", color: "#ff9800", marginTop: "4px" }}>
        {"★".repeat(clampedRating)}
        {"☆".repeat(5 - clampedRating)}
      </div>
      <button
        onClick={onAddToCart}
        disabled={!inStock}
        style={{
          marginTop: "12px",
          padding: "8px 16px",
          backgroundColor: inStock ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: inStock ? "pointer" : "not-allowed",
        }}
      >
        {inStock ? "Add to Cart" : "Out of Stock"}
      </button>
    </div>
  );
};
