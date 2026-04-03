import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { QuoteApiResponse, QuoteApiError } from "@/types/quote";
import { QuoteViewer } from "@/components/quote/quote-viewer";

// Next.js 16: params는 Promise 타입
type Props = {
  params: Promise<{ token: string }>;
};

// 페이지 메타데이터 동적 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const result = await fetchQuote(token);

  if ("error" in result) {
    return { title: "견적서를 찾을 수 없습니다" };
  }

  return {
    title: `${result.data.quoteNumber} — ${result.data.clientName}`,
    description: `${result.data.provider.name}에서 발송한 견적서입니다.`,
    // 견적서 페이지는 검색엔진 색인 차단
    robots: { index: false, follow: false },
  };
}

// 서버 측에서 내부 API를 직접 호출하는 헬퍼
// (서버 컴포넌트 → API Route가 아닌 직접 Notion 연동도 가능하지만,
//  API Route를 통해 로직을 한 곳에서 관리)
async function fetchQuote(token: string): Promise<QuoteApiResponse | QuoteApiError> {
  // 서버 사이드 내부 API 호출: 절대 URL 필요
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/quote/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });

  const json = await response.json();
  return json;
}

// 견적서 조회 페이지 (서버 컴포넌트)
export default async function QuotePage({ params }: Props) {
  const { token } = await params;
  const result = await fetchQuote(token);

  // 오류 유형에 따른 처리
  if ("error" in result) {
    if (result.code === "NOT_FOUND" || result.code === "INVALID_TOKEN") {
      notFound();
    }

    // 만료 또는 서버 오류는 별도 에러 메시지 표시
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <div className="space-y-2" role="alert">
          <h1 className="text-2xl font-bold">
            {result.code === "EXPIRED" ? "만료된 견적서" : "오류 발생"}
          </h1>
          <p className="text-muted-foreground max-w-sm">{result.error}</p>
          {result.code === "EXPIRED" && result.expiry_date && (
            <p className="text-sm text-muted-foreground">
              유효기간: {result.expiry_date.replace(
                /(\d{4})-(\d{2})-(\d{2})/,
                "$1년 $2월 $3일"
              )}까지
            </p>
          )}
        </div>
      </div>
    );
  }

  return <QuoteViewer quote={result.data} />;
}
