/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Font chính cho toàn trang web
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        // Font dành riêng cho các mã ID, số tài khoản (trông sẽ rất công nghệ)
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

