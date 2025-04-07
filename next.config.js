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
  // トランスパイル対象のパッケージを指定
  transpilePackages: ["lucide-react", "@radix-ui/react-label", "@radix-ui/react-switch", "class-variance-authority"],
}

module.exports = nextConfig

