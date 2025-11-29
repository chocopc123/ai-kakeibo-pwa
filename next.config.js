const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack設定（Next.js 16対応）
  turbopack: {
    // 空の設定でエラーを回避
  },
  webpack: (config) => {
    // sql.jsのWASMファイルを処理
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: false,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = withPWA(nextConfig);
