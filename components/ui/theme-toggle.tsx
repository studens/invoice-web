"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";

// 서버에서는 항상 false, 클라이언트 구독 시 true 반환하는 헬퍼
// useEffect + setState 대신 useSyncExternalStore로 hydration 불일치 방지
function subscribe() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,  // 클라이언트 스냅샷
    () => false  // 서버 스냅샷
  );
}

// 라이트/다크 모드 전환 버튼
// resolvedTheme으로 system 테마를 실제 값으로 해석
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    // 서버 렌더링 시 빈 버튼으로 hydration 불일치 방지
    return <Button variant="ghost" size="icon" aria-label="테마 전환" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="테마 전환"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
