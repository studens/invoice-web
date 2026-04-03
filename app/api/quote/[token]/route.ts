import type { NextRequest } from "next/server";
import type { QuoteApiResponse, QuoteApiError, QuoteItem } from "@/types/quote";

// Notion API 응답에 대한 최소 타입 인터페이스 (전체 타이핑은 과도한 복잡도)
interface NotionRelationItem {
  id: string;
}

interface NotionPage {
  id: string;
  properties: Record<string, unknown>;
}

// Notion 텍스트 콘텐츠 최소 타입
interface NotionTextContent {
  plain_text: string;
}

// Notion 항목 페이지 프로퍼티 최소 타입
interface NotionItemProperties {
  item_name?: { title?: NotionTextContent[] };
  quantity?: { number?: number };
  unit_price?: { number?: number };
  amount?: { number?: number };
  note?: { rich_text?: NotionTextContent[] };
}

// Notion 항목 페이지 최소 타입
interface NotionItemPage {
  properties: NotionItemProperties;
}

// Notion 데이터베이스 쿼리 응답 최소 타입
interface NotionQueryResponse {
  results: NotionPage[];
}

// Notion 견적서 페이지 프로퍼티 최소 타입
interface NotionQuoteProperties {
  expires_at?: { date?: { start?: string } };
  quote_number?: { title?: NotionTextContent[] };
  title?: { rich_text?: NotionTextContent[] };
  client_name?: { rich_text?: NotionTextContent[] };
  issued_at?: { date?: { start?: string } };
  subtotal?: { number?: number };
  tax_rate?: { number?: number };
  memo?: { rich_text?: NotionTextContent[] };
  currency?: { select?: { name?: string } };
  status?: { select?: { name?: string } };
  items?: { relation?: NotionRelationItem[] };
}

// Items DB의 각 항목 페이지를 병렬로 조회하여 QuoteItem[] 반환 (옵션 B)
async function parseLineItems(page: NotionPage, notionApiKey: string): Promise<QuoteItem[]> {
  const props = page.properties as NotionQuoteProperties;
  const relationIds: string[] = (props.items?.relation ?? []).map(
    (r: NotionRelationItem) => r.id
  );

  if (relationIds.length === 0) return [];

  // 각 항목 페이지를 병렬 조회 (각각 독립 타임아웃 적용)
  const itemPages = await Promise.all(
    relationIds.map(async (id) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
          headers: {
            Authorization: `Bearer ${notionApiKey}`,
            "Notion-Version": "2022-06-28",
          },
          signal: controller.signal,
          // 60초 캐싱 (견적서 항목은 발송 후 잘 변경되지 않음)
          next: { revalidate: 60 },
        });
        if (!res.ok) {
          console.error("[API] 항목 조회 오류:", id, res.status);
          return null;
        }
        return res.json() as Promise<NotionItemPage>;
      } finally {
        clearTimeout(timeoutId);
      }
    })
  );

  return itemPages.flatMap((itemPage: NotionItemPage | null) => {
    if (!itemPage) return [];
    const p = itemPage.properties;
    return [{
      name: p.item_name?.title?.[0]?.plain_text ?? "",
      quantity: p.quantity?.number ?? 1,
      unitPrice: p.unit_price?.number ?? 0,
      amount: p.amount?.number ?? 0,
      note: p.note?.rich_text?.[0]?.plain_text ?? undefined,
    }];
  });
}

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

  // 토큰 기본 유효성 검사 (빈 값 / 비정상 길이 차단, 최소 16자 이상)
  if (!token || token.length < 16 || token.length > 128) {
    const errorResponse: QuoteApiError = {
      error: "유효하지 않은 토큰입니다.",
      code: "INVALID_TOKEN",
    };
    return Response.json(errorResponse, { status: 400 });
  }

  try {
    // Notion 데이터베이스에서 토큰으로 견적서 조회 (10초 타임아웃)
    const dbController = new AbortController();
    const dbTimeoutId = setTimeout(() => dbController.abort(), 10_000);

    let notionResponse: Response;
    try {
      notionResponse = await fetch(
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
          signal: dbController.signal,
          // 60초 캐싱 (견적서는 발송 후 잘 변경되지 않음)
          next: { revalidate: 60 },
        }
      );
    } finally {
      clearTimeout(dbTimeoutId);
    }

    if (!notionResponse.ok) {
      console.error("[API] Notion API 오류:", notionResponse.status, notionResponse.statusText);
      const errorResponse: QuoteApiError = {
        error: "데이터를 불러오는 중 오류가 발생했습니다.",
        code: "INTERNAL_ERROR",
      };
      return Response.json(errorResponse, { status: 502 });
    }

    const notionData: NotionQueryResponse = await notionResponse.json() as NotionQueryResponse;

    // 검색 결과 없음
    if (!notionData.results || notionData.results.length === 0) {
      const errorResponse: QuoteApiError = {
        error: "견적서를 찾을 수 없습니다.",
        code: "NOT_FOUND",
      };
      return Response.json(errorResponse, { status: 404 });
    }

    const page: NotionPage = notionData.results[0];
    const props = page.properties as NotionQuoteProperties;

    // 만료일 확인
    const expiresAt: string | undefined =
      props.expires_at?.date?.start ?? undefined;

    if (expiresAt && new Date(expiresAt) < new Date()) {
      const errorResponse: QuoteApiError = {
        error: "견적서 유효 기간이 만료되었습니다.",
        code: "EXPIRED",
        expiry_date: expiresAt,
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

    // Items DB에서 관련 항목 병렬 조회 (옵션 B: Relation 방식)
    const items = await parseLineItems(page, notionApiKey);

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
        currency: (props.currency?.select?.name as "KRW" | "USD" | undefined) ?? "KRW",
        status: props.status?.select?.name ?? undefined,
        provider,
      },
    };

    return Response.json(responseData);
  } catch (error) {
    // 타임아웃 오류 처리
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[API] Notion API 타임아웃");
      const errorResponse: QuoteApiError = {
        error: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
        code: "INTERNAL_ERROR",
      };
      return Response.json(errorResponse, { status: 504 });
    }
    console.error("[API] 예기치 않은 오류:", error);
    const errorResponse: QuoteApiError = {
      error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      code: "INTERNAL_ERROR",
    };
    return Response.json(errorResponse, { status: 500 });
  }
}
