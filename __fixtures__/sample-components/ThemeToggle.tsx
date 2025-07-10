import React from "react";

type ThemeToggleProps = {
  isDarkMode: boolean;
  toggle: () => void;
};

export const ThemeToggle = ({ isDarkMode, toggle }: ThemeToggleProps) => (
  <label>
    <input type="checkbox" checked={isDarkMode} onChange={toggle} />
    Dark Mode
  </label>
);
