import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 모든 경로에 보안 헤더 적용
        source: "/:path*",
        headers: [
          {
            // MIME 타입 스니핑 방지
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // 클릭재킹 공격 방지 (iframe 임베딩 차단)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Referer 헤더 보안 정책 설정
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
