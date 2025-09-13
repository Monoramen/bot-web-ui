// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Предупреждение: это позволит сборке завершиться успешно, даже если есть ошибки ESLint.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Предупреждение: это позволит сборке завершиться успешно, даже если есть ошибки TypeScript.
    ignoreBuildErrors: false,
  },
};

export default nextConfig;