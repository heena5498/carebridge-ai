/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: "#1B5E3B",
          light: "#E8F0E4",
        },
        cream: {
          DEFAULT: "#FDF6EC",
          border: "#E0D5C0",
          "border-dark": "#C4B9A0",
          strip: "#F0E8D8",
        },
        "text-primary": "#1E293B",
        "text-secondary": "#5C4A2E",
        "text-muted": "#7A6B52",
        "text-hint": "#A39880",
        "status-done-bg": "#DBEAFE",
        "status-done-text": "#1E40AF",
        "status-pending-bg": "#FEF3C7",
        "status-pending-text": "#92400E",
        "status-critical-bg": "#FEE2E2",
        "status-critical-text": "#991B1B",
        "status-complete-bg": "#DCFCE7",
        "status-complete-text": "#14532D",
        "status-inactive-bg": "#F1EFE8",
        "status-inactive-text": "#5F5E5A",
      },
      borderRadius: {
        card: "10px",
        sm2: "6px",
        pill: "20px",
      },
    },
  },
  plugins: [],
};
