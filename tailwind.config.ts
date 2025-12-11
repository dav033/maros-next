import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../davComponents/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@dav033/dav-components/src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@dav033/dav-components/dist/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;

