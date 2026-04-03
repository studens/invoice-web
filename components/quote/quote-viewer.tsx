"use client";

import type { QuoteData } from "@/types/quote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-react";

// 금액을 통화 형식으로 포맷 (KRW 기본, USD 지원)
function formatCurrency(amount: number, currency?: string): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: 0,
  }).format(amount);
}

// 날짜를 읽기 좋은 형식으로 포맷 (YYYY-MM-DD → YYYY년 MM월 DD일)
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${month}월 ${day}일`;
}

interface QuoteViewerProps {
  quote: QuoteData;
}

// 견적서 렌더링 컴포넌트
// PDF 출력 시 print 미디어 쿼리가 적용됨
export function QuoteViewer({ quote }: QuoteViewerProps) {
  // 브라우저 Print API로 PDF 저장
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* PDF 출력 시 숨겨지는 상단 액션 바 */}
      <div className="print:hidden sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          견적서 #{quote.quoteNumber}
        </p>
        <Button onClick={handlePrint} size="sm" variant="outline" aria-label="견적서 PDF 저장">
          <Printer className="size-4 mr-2" />
          PDF 저장
        </Button>
      </div>

      {/* 견적서 본문 */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 print:px-0 print:py-0 print:max-w-none">
        {/* 헤더: 제목 + 견적 번호 */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">견적서</h1>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                No. {quote.quoteNumber}
              </p>
              {/* 견적서 상태 배지 */}
              {quote.status && (
                <Badge
                  variant={
                    quote.status === "만료됨"
                      ? "destructive"
                      : quote.status === "발송됨"
                        ? "default"
                        : "secondary"
                  }
                >
                  {quote.status}
                </Badge>
              )}
            </div>
          </div>
          {/* 공급자 로고 (있는 경우) / 없으면 회사명 텍스트 폴백 */}
          {quote.provider.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={quote.provider.logoUrl}
              alt={`${quote.provider.name} 로고`}
              className="h-12 w-auto object-contain"
              loading="lazy"
            />
          ) : (
            <p className="text-xl font-bold">{quote.provider.name}</p>
          )}
        </div>

        {/* 공급자 / 클라이언트 정보 */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 공급자 */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              공급자
            </p>
            <p className="font-semibold">{quote.provider.name}</p>
            <p className="text-sm text-muted-foreground">{quote.provider.email}</p>
            {quote.provider.phone && (
              <p className="text-sm text-muted-foreground">{quote.provider.phone}</p>
            )}
            {quote.provider.address && (
              <p className="text-sm text-muted-foreground">{quote.provider.address}</p>
            )}
          </div>

          {/* 클라이언트 + 날짜 정보 */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              수신
            </p>
            <p className="font-semibold">{quote.clientName}</p>
            <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
              <p>발행일: {formatDate(quote.issuedAt)}</p>
              {quote.expiresAt && (
                <p>유효기간: {formatDate(quote.expiresAt)}</p>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* 견적 항목 테이블 */}
        <div className="mb-6 overflow-x-auto" aria-label="견적 항목 목록">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">항목명</TableHead>
                <TableHead className="text-right">수량</TableHead>
                <TableHead className="text-right">단가</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    견적 항목이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                quote.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.note && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.quantity.toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.unitPrice, quote.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(item.amount, quote.currency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 합계 영역 */}
        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">소계</span>
              <span className="tabular-nums">{formatCurrency(quote.subtotal, quote.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                부가세 ({Math.round(quote.taxRate * 100)}%)
              </span>
              <span className="tabular-nums">{formatCurrency(quote.tax, quote.currency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>합계</span>
              <span className="tabular-nums">{formatCurrency(quote.total, quote.currency)}</span>
            </div>
          </div>
        </div>

        {/* 메모 (있는 경우) */}
        {quote.memo && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              메모
            </p>
            <p className="text-sm whitespace-pre-wrap">{quote.memo}</p>
          </div>
        )}
      </div>
    </div>
  );
}
