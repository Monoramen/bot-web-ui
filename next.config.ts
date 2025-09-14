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
    async rewrites() {
    return [
      {
        source: '/api/:path*', // Перехватывать все запросы, начинающиеся с /api/
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, // и перенаправлять их сюда
      },
    ];
  },
};
export default nextConfig;