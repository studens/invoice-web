# CLAUDE.md

이 파일은 이 저장소에서 작업할 때 Claude Code(claude.ai/code)에 지침을 제공합니다.

@AGENTS.md

## Project Context
- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md

## 명령어

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## 아키텍처

Next.js 16 App Router 기반 스타터 킷. 테스트 프레임워크 미설정.

### 디렉토리 구조
- `app/` — App Router 페이지 및 레이아웃 (서버 컴포넌트 기본)
- `components/layout/` — Navbar, Footer, PageWrapper
- `components/providers/` — ThemeProvider (클라이언트 컴포넌트)
- `components/sections/` — 랜딩 페이지 섹션 (Hero, Features, Pricing, CTA, Contact)
- `components/ui/` — shadcn/ui 컴포넌트 27개 (Radix UI 기반)
- `lib/utils.ts` — `cn()` 유틸리티 (clsx + tailwind-merge)

### 컴포넌트 패턴
- 서버 컴포넌트 우선; 상호작용/상태 필요 시에만 `"use client"` 추가
- UI 컴포넌트는 `npx shadcn add <컴포넌트명>`으로 추가 (components.json 설정 참조)
- 폼: react-hook-form + zod 스키마 검증
- 아이콘: lucide-react

### 스타일링
- Tailwind CSS v4 (CSS-first, OKLCH 색상 시스템)
- CSS 변수는 `app/globals.css`에서 관리 (`:root` 및 `.dark`)
- 클래스 병합: `cn()` from `@/lib/utils`
- 다크 모드: next-themes (ThemeProvider 래핑 필수)

### 경로 별칭
- `@/*` → 프로젝트 루트 (예: `@/components/ui/button`)
