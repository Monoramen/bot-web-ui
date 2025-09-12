// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Предупреждение: это позволит сборке завершиться успешно, даже если есть ошибки ESLint.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Предупреждение: это позволит сборке завершиться успешно, даже если есть ошибки TypeScript.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;