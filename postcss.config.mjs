import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      content: [
        resolve(__dirname, "./src/**/*.{js,ts,jsx,tsx,mdx}"),
        resolve(__dirname, "../davComponents/src/**/*.{js,ts,jsx,tsx,mdx}"),
      ],
    },
  },
};

export default config;
