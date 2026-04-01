import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

// 404 커스텀 페이지
// Next.js App Router에서 자동으로 not-found 라우트로 처리됨
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold text-muted-foreground">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground max-w-sm">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <ArrowLeft className="size-4" />
          홈으로 돌아가기
        </Link>
      </Button>
    </div>
  );
}
