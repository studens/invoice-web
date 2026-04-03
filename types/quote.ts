// 견적서 데이터 타입 정의

/** 견적 항목 하나 */
export interface QuoteItem {
  /** 항목명 (작업/서비스 이름) */
  name: string;
  /** 수량 */
  quantity: number;
  /** 단가 (원) */
  unitPrice: number;
  /** 금액 = 수량 × 단가 */
  amount: number;
  /** 비고 (선택) */
  note?: string;
}

/** 견적서 공급자(발행자) 정보 */
export interface QuoteProvider {
  /** 업체명 또는 개인 이름 */
  name: string;
  /** 이메일 */
  email: string;
  /** 연락처 (선택) */
  phone?: string;
  /** 주소 (선택) */
  address?: string;
  /** 로고 이미지 URL (선택) */
  logoUrl?: string;
}

/** 견적서 전체 데이터 */
export interface QuoteData {
  /** 견적서 번호 */
  quoteNumber: string;
  /** 견적서 제목 */
  title: string;
  /** 클라이언트 이름 또는 업체명 */
  clientName: string;
  /** 발행일 (YYYY-MM-DD) */
  issuedAt: string;
  /** 유효 기간 만료일 (YYYY-MM-DD, 선택) */
  expiresAt?: string;
  /** 견적 항목 목록 */
  items: QuoteItem[];
  /** 소계 (세금 전) */
  subtotal: number;
  /** 세율 (예: 0.1 = 10%) */
  taxRate: number;
  /** 세액 */
  tax: number;
  /** 총액 */
  total: number;
  /** 메모 (선택) */
  memo?: string;
  /** 통화 단위 (선택, 기본 KRW) */
  currency?: "KRW" | "USD";
  /** 견적서 상태 (선택: 초안/발송됨/만료됨) */
  status?: string;
  /** 공급자 정보 */
  provider: QuoteProvider;
}

/** API 응답 래퍼 */
export interface QuoteApiResponse {
  data: QuoteData;
}

/** API 오류 응답 */
export interface QuoteApiError {
  error: string;
  code: "NOT_FOUND" | "EXPIRED" | "INVALID_TOKEN" | "INTERNAL_ERROR";
  /** 만료일 (EXPIRED 오류 시 포함) */
  expiry_date?: string;
}
