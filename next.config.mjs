/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 서버 사이드에서만 사용되는 패키지들을 외부 패키지로 처리
  // Turbopack과 webpack 모두에서 작동
  serverExternalPackages: ['onnxruntime-node'],
  // Turbopack 설정 추가 (빈 객체로 설정하여 에러 방지)
  turbopack: {},
}

export default nextConfig
