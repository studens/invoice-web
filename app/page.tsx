import { FileText } from "lucide-react";

// 루트 페이지: 견적서 링크 없이 직접 접속 시 안내 메시지 표시
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <FileText className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">견적서 웹 뷰어</h1>
        <p className="text-muted-foreground max-w-sm">
          견적서를 확인하려면 담당자로부터 받은 링크를 통해 접속해 주세요.
        </p>
      </div>
    </div>
  );
}
