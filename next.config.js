/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 本番ビルド時にESLintエラーを無視する
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時にTypeScriptエラーを無視する
    ignoreBuildErrors: true,
  },
  // Webpackの設定をカスタマイズ
  webpack: (config, { isServer }) => {
    // undiciモジュールの問題を回避
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        undici: false,
      }
    }

    return config
  },
  // 実験的機能を有効化
  experimental: {
    serverComponentsExternalPackages: ["axios", "cheerio"],
  },
}

module.exports = nextConfig

