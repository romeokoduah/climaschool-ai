/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', "Nunito", "system-ui", "sans-serif"],
        body: ['"Nunito"', "system-ui", "sans-serif"],
        hand: ['"Caveat"', '"Comic Sans MS"', "cursive"]
      },
      colors: {
        ink:    { DEFAULT: "#1a140a", 2: "#5b513e", 3: "#95876c" },
        paper:  "#ffffff",
        cream:  { DEFAULT: "#fbf7ee", 2: "#f3ecdc" },
        line:   { DEFAULT: "#ece4d2", 2: "#d9cdb1" },
        heat:   "#ff6a3d",
        sun:    "#ffc94d",
        sky:    "#5e9bff",
        leaf:   "#5fc16f",
        mint:   "#5fd6c4",
        coral:  "#ff7b9d",
        plum:   "#7c5cff"
      },
      borderRadius: {
        xl2: "22px",
        xl3: "30px",
        xl4: "40px"
      },
      boxShadow: {
        soft:  "0 6px 16px -8px rgba(60, 40, 10, .15)",
        lift:  "0 16px 36px -14px rgba(60, 40, 10, .25)",
        big:   "0 30px 70px -28px rgba(60, 40, 10, .35)",
        glow:  "0 0 0 6px rgba(255, 106, 61, .14)"
      }
    }
  },
  plugins: []
};
