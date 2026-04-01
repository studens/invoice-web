"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes ThemeProvider 래퍼 컴포넌트
// attribute="class" → <html> 요소에 .dark 클래스를 토글하여 Tailwind 다크모드 활성화
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
