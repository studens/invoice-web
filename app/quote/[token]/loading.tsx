import { Skeleton } from "@/components/ui/skeleton";

// 견적서 로딩 중 스켈레톤 UI
// Next.js Suspense 경계로 자동 표시됨
export default function QuoteLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* 헤더 영역 스켈레톤 */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-28" />
        </div>

        {/* 공급자 / 클라이언트 정보 스켈레톤 */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* 견적 항목 테이블 스켈레톤 */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>

        {/* 합계 영역 스켈레톤 */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
