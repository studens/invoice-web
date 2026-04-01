import type { NextRequest } from "next/server";
import type { QuoteApiResponse, QuoteApiError } from "@/types/quote";

// Next.js 16: params는 Promise 타입 — await 필수
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  // 환경변수 검증 (서버 사이드에서만 실행됨)
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !notionDatabaseId) {
    const errorResponse: QuoteApiError = {
      error: "서버 설정이 올바르지 않습니다.",
      code: "INTERNAL_ERROR",
    };
    return Response.json(errorResponse, { status: 500 });
  }

  // 토큰 기본 유효성 검사 (빈 값 / 비정상 길이 차단)
  if (!token || token.length < 8 || token.length > 128) {
    const errorResponse: QuoteApiError = {
      error: "유효하지 않은 토큰입니다.",
      code: "INVALID_TOKEN",
    };
    return Response.json(errorResponse, { status: 400 });
  }

  try {
    // Notion 데이터베이스에서 토큰으로 견적서 조회
    const notionResponse = await fetch(
      `https://api.notion.com/v1/databases/${notionDatabaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          filter: {
            property: "token",
            rich_text: {
              equals: token,
            },
          },
          page_size: 1,
        }),
        // 매 요청마다 Notion에서 최신 데이터 조회 (캐시 비활성화)
        cache: "no-store",
      }
    );

    if (!notionResponse.ok) {
      console.error("[API] Notion API 오류:", notionResponse.status, notionResponse.statusText);
      const errorResponse: QuoteApiError = {
        error: "데이터를 불러오는 중 오류가 발생했습니다.",
        code: "INTERNAL_ERROR",
      };
      return Response.json(errorResponse, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notionData: any = await notionResponse.json();

    // 검색 결과 없음
    if (!notionData.results || notionData.results.length === 0) {
      const errorResponse: QuoteApiError = {
        error: "견적서를 찾을 수 없습니다.",
        code: "NOT_FOUND",
      };
      return Response.json(errorResponse, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page: any = notionData.results[0];
    const props = page.properties;

    // 만료일 확인
    const expiresAt: string | undefined =
      props.expires_at?.date?.start ?? undefined;

    if (expiresAt && new Date(expiresAt) < new Date()) {
      const errorResponse: QuoteApiError = {
        error: "만료된 견적서입니다.",
        code: "EXPIRED",
      };
      return Response.json(errorResponse, { status: 410 });
    }

    // 공급자 정보는 환경변수에서 주입 (DB에 저장하지 않음)
    const provider = {
      name: process.env.PROVIDER_NAME ?? "",
      email: process.env.PROVIDER_EMAIL ?? "",
      phone: process.env.PROVIDER_PHONE,
      address: process.env.PROVIDER_ADDRESS,
      logoUrl: process.env.PROVIDER_LOGO_URL,
    };

    // Notion 속성을 견적서 데이터 구조로 변환
    // TODO: Notion 데이터베이스 속성명에 맞게 매핑 업데이트 필요
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawItems: any[] = props.items?.relation ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = rawItems.map((item: any) => ({
      name: item.name ?? "",
      quantity: Number(item.quantity ?? 1),
      unitPrice: Number(item.unit_price ?? 0),
      amount: Number(item.amount ?? 0),
      note: item.note ?? undefined,
    }));

    const subtotal: number = Number(props.subtotal?.number ?? 0);
    const taxRate: number = Number(props.tax_rate?.number ?? 0.1);
    const tax: number = Math.round(subtotal * taxRate);
    const total: number = subtotal + tax;

    const responseData: QuoteApiResponse = {
      data: {
        quoteNumber: props.quote_number?.title?.[0]?.plain_text ?? token.slice(0, 8).toUpperCase(),
        title: props.title?.rich_text?.[0]?.plain_text ?? "견적서",
        clientName: props.client_name?.rich_text?.[0]?.plain_text ?? "",
        issuedAt: props.issued_at?.date?.start ?? new Date().toISOString().slice(0, 10),
        expiresAt,
        items,
        subtotal,
        taxRate,
        tax,
        total,
        memo: props.memo?.rich_text?.[0]?.plain_text ?? undefined,
        provider,
      },
    };

    return Response.json(responseData);
  } catch (error) {
    console.error("[API] 예기치 않은 오류:", error);
    const errorResponse: QuoteApiError = {
      error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      code: "INTERNAL_ERROR",
    };
    return Response.json(errorResponse, { status: 500 });
  }
}
