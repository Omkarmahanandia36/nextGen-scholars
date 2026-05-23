import type { Config } from "tailwindcss";
import { withUt } from "uploadthing/tw";

export default withUt({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Navbar & Footer gradient classes - never purge these
    "from-blue-600",
    "to-blue-400",
    "to-blue-500",
    "to-blue-300",
    "from-blue-400",
    "from-blue-500",
    "to-blue-600",
    "bg-blue-400",
    "bg-blue-500",
    "from-teal-500",
    "to-teal-500",
    "to-teal-400",
    "from-teal-400",
    "bg-teal-500",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
}) satisfies Config;

