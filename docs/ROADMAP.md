# Notion 견적서 웹 뷰어 로드맵

> 작성일: 2026-04-01 | 버전: v1.1 (Playwright E2E 테스트 포함)

---

## 프로젝트 개요

### 비전 및 목표

Notion을 데이터 원천으로 사용하는 프리랜서·소규모 에이전시가 클라이언트에게 전문적인 견적서를 링크 하나로 즉시 전달할 수 있도록 한다. 별도 견적서 툴 없이, Notion 작성 → 링크 공유 → 브라우저 조회 → PDF 저장의 워크플로를 완성한다.

### 핵심 성공 지표 (KPI)

| 지표 | 목표 |
|------|------|
| 견적서 페이지 LCP | 3초 이내 |
| Notion API 타임아웃 | 10초 설정, 초과 시 오류 처리 |
| 유효하지 않은 토큰 응답 | 일관된 404 반환 (열거 공격 방지) |
| 인쇄 CSS 적용 | `@media print`로 버튼/헤더 숨김 완료 |
| 모바일 지원 | 360px / 768px / 1280px 3개 뷰포트 |
| E2E 테스트 커버리지 | API 연동 + 비즈니스 로직 핵심 시나리오 전체 통과 |

### 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 App Router (TypeScript) |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반) |
| 스타일링 | Tailwind CSS v4 (OKLCH 색상, `@media print`) |
| 폼 검증 | react-hook-form + zod |
| PDF | `window.print()` + 인쇄용 CSS |
| 데이터 소스 | Notion API (`NOTION_API_KEY`, `NOTION_DATABASE_ID`) |
| E2E 테스트 | Playwright MCP |
| 배포 | Vercel |

### 팀 구성 (역할 기준)

- **풀스택 개발자**: API Route 구현, Notion 연동, 서버 컴포넌트
- **프론트엔드 개발자**: 견적서 UI 렌더링, 인쇄 CSS, 반응형 레이아웃
- **QA / 기획**: Notion 데이터베이스 스키마 검증, E2E 시나리오 테스트

> ⚠️ 가정: 1인 또는 소규모 팀(2인 이하)으로 운영된다고 가정합니다. Phase 규모와 태스크 분해 단위를 이에 맞게 설계했습니다.

---

## 목표 및 범위

### In-Scope (MVP 포함)

- `F001` 견적서 데이터 조회: 토큰 → Notion API → 데이터 파싱
- `F002` 견적서 웹 렌더링: 브랜드화된 레이아웃으로 데이터 표시
- `F003` PDF 다운로드: `window.print()` + `@media print` CSS
- `F004` 토큰 기반 접근 제어: URL 토큰 검증, 열거 공격 방지
- `F005` 견적 항목 계산 표시: 항목별 수량·단가·금액·소계·세금·총액
- `F010` 오류 처리 및 안내: 404 / 410 / 500 오류별 사용자 친화적 메시지
- `F011` 로딩 상태 표시: Skeleton UI (`loading.tsx`)

### Out-of-Scope (MVP 이후)

- 서비스 제공자 로그인 및 대시보드 (Phase 2)
- 견적서 상태 추적, 자동 토큰 생성 (Phase 2)
- 온라인 승인 버튼, 전자 서명, 수정 요청, 이메일 자동 발송 (Phase 3)
- 견적서 템플릿, 다국어 지원, 브랜딩 커스터마이징, 서버사이드 PDF (Phase 4)
- 자체 데이터베이스 (MVP에서는 Notion이 유일한 저장소)
- 사용자 인증 (MVP에서는 토큰 기반 링크만 사용)

---

## 마일스톤 요약

| Phase | 기간 | 주요 목표 | 완료 기준 |
|-------|------|-----------|-----------|
| **Phase 1** | 2026-04-01 ~ 2026-04-14 (2주) | Notion 연동 완성 + API E2E 검증 | API Route에서 Notion 데이터 정상 반환, E2E 토큰 시나리오 통과, `npm run build` 통과 |
| **Phase 2** | 2026-04-15 ~ 2026-04-28 (2주) | 견적서 UI 완성 + PDF 출력 + UI E2E 검증 | 견적서 전체 렌더링, PDF 저장 동작, 반응형 확인, UI E2E 통과 |
| **Phase 3** | 2026-04-29 ~ 2026-05-12 (2주) | 오류 처리 강화 + 성능 최적화 + Vercel 배포 | 모든 오류 시나리오 E2E 통과, LCP 3초 이내, 프로덕션 배포 완료 |
| **Phase 4+** | 2026-05-13 이후 | 관리 기능 / 클라이언트 인터랙션 | MVP 이후 기능 순차 추가 |

---

## 상세 개발 계획

### Phase 1: Notion 연동 완성 + API E2E 검증 (2026-04-01 ~ 2026-04-14)

#### 목표

견적서 데이터를 Notion에서 안전하게 조회하여 API로 반환하는 서버 측 파이프라인을 완성하고, Playwright MCP로 API 엔드포인트의 모든 응답 시나리오를 자동화 검증한다.

#### 현재 구현 상태 (착수 시점 기준)

다음 항목은 이미 구현이 완료되어 있습니다:

- [x] `types/quote.ts` — `QuoteData`, `QuoteItem`, `QuoteProvider`, `QuoteApiResponse`, `QuoteApiError` 타입 정의
- [x] `app/api/quote/[token]/route.ts` — Notion API 연동, 토큰 검증, 만료일 체크, 오류 응답 처리 (단, 항목 파싱 로직 TODO 상태)
- [x] `app/quote/[token]/page.tsx` — 서버 컴포넌트, `generateMetadata`, 오류 분기
- [x] `app/quote/[token]/loading.tsx` — Skeleton UI
- [x] `components/quote/quote-viewer.tsx` — 견적서 렌더링 클라이언트 컴포넌트 (기본 구조)

#### 세부 태스크

**[1-1] 환경 설정**

- [ ] `.env.local` 파일 생성 및 필수 환경변수 세팅
  - 필수: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `PROVIDER_NAME`, `PROVIDER_EMAIL`, `NEXT_PUBLIC_BASE_URL`
  - 선택: `PROVIDER_PHONE`, `PROVIDER_ADDRESS`, `PROVIDER_LOGO_URL`
- [ ] `.env.example` 파일 작성 (팀 온보딩용, 실제 값 제외)
- [ ] Vercel 프로젝트 생성 및 환경변수 등록

**[1-2] Notion 데이터베이스 스키마 확정**

- [ ] Notion에 `Quotes` 데이터베이스 생성 (PRD 5절 속성 구조 기준)
  - 필수 속성: `token` (Rich Text), `client_name` (Rich Text), `client_email` (Email), `issue_date` (Date), `expiry_date` (Date), `currency` (Select: KRW/USD), `tax_rate` (Number), `notes` (Rich Text), `status` (Select: 초안/발송됨/만료됨)
- [ ] 견적 항목 처리 방식 최종 결정: 페이지 본문 테이블 블록(옵션 A) vs 하위 데이터베이스(옵션 B)
  > ⚠️ 가정: 단순성을 위해 옵션 A(페이지 본문 테이블 블록)를 사용한다고 가정합니다. 최종 결정 후 항목 파싱 로직을 업데이트해야 합니다.
- [ ] Notion Integration 생성 및 데이터베이스 연결 허용
- [ ] 테스트용 견적서 페이지 3개 생성
  - 케이스 A: 정상 견적서 (유효 토큰, 항목 3개 이상)
  - 케이스 B: 만료된 견적서 (`expiry_date` 과거 날짜)
  - 케이스 C: 항목 없는 견적서 (빈 테이블 블록)

**[1-3] API Route 핵심 로직 완성 (F001, F004)**

- [ ] `app/api/quote/[token]/route.ts` — 페이지 본문 블록 조회 및 파싱 로직 구현
  - `GET /v1/blocks/{page_id}/children` 호출
  - 테이블 블록 파싱하여 `QuoteItem[]`(항목명, 수량, 단가, 금액, 비고) 변환
  - `TODO` 주석으로 표시된 `rawItems` 매핑 로직 실제 구현으로 교체
- [ ] Notion API 타임아웃 10초 설정: `AbortController` 활용
- [ ] 토큰 형식 검증: 최소 16자 이상 체크 (현재 8자 → 16자로 상향)
- [ ] 서버 시작 시 필수 환경변수 검증 로직 추가 (누락 시 명확한 오류 메시지)
- [ ] `revalidate` 또는 `unstable_cache`를 활용한 60초 캐싱 전략 적용 (현재 `no-store` → 변경)
  > ⚠️ 가정: 견적서는 발송 후 잘 변경되지 않으므로 60초 캐싱을 적용합니다. 실시간 반영이 필요하면 `no-store` 유지.

**[1-4] Playwright MCP E2E 테스트 — API 시나리오 (F001, F004 대응)**

> API 연동 로직 구현([1-3])과 쌍으로 진행합니다. 개발 서버(`npm run dev`) 기동 후 테스트를 실행합니다.

- [ ] **시나리오 1: 정상 토큰 → 200 응답 검증**
  - `GET /api/quote/{valid_token}` 호출
  - 응답 상태 코드 200 확인
  - 응답 JSON에 `id`, `title`, `client`, `provider`, `line_items`, `subtotal`, `tax_amount`, `total` 필드 존재 확인
  - `line_items` 배열 항목에 `name`, `quantity`, `unit_price`, `amount` 필드 확인
- [ ] **시나리오 2: 존재하지 않는 토큰 → 404 응답 검증**
  - `GET /api/quote/invalid-token-xyz` 호출
  - 응답 상태 코드 404 확인
  - 응답 JSON `error` 필드 값 `QUOTE_NOT_FOUND` 확인
- [ ] **시나리오 3: 만료된 토큰 → 410 응답 검증**
  - `GET /api/quote/{expired_token}` 호출
  - 응답 상태 코드 410 확인
  - 응답 JSON `error` 필드 값 `QUOTE_EXPIRED` 확인
  - 응답 JSON에 `expiry_date` 필드 존재 확인
- [ ] **시나리오 4: 열거 공격 방지 검증**
  - 서로 다른 잘못된 토큰 3개(`aaa`, `bbb`, `ccc`) 연속 요청
  - 모두 동일한 404 응답 반환 확인 (응답 구조 일관성 검증)
- [ ] **시나리오 5: 항목 없는 견적서 → 빈 배열 처리**
  - `GET /api/quote/{empty_items_token}` 호출
  - 응답 상태 코드 200 확인
  - `line_items` 필드가 빈 배열(`[]`) 확인

**[1-5] 검증**

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] Vercel Preview 배포 성공

#### 기술적 고려사항

- `route.ts`의 `params`는 Next.js 16에서 `Promise<{ token: string }>` 타입 — 이미 `await` 처리됨
- `NOTION_API_KEY`는 서버 사이드 환경변수만 사용 (`NEXT_PUBLIC_` 접두사 절대 금지)
- Notion API 응답의 `any` 타입 처리는 Phase 3에서 타입 가드로 교체 예정 (Phase 1에서는 `eslint-disable` 주석 유지)

#### 완료 기준 (Definition of Done)

- Notion에서 실제 데이터가 `/api/quote/[token]`을 통해 정상 반환됨
- 404 / 410 / 500 응답이 API 명세대로 동작
- Playwright MCP E2E 시나리오 1~5 전체 통과
- `npm run lint` / `npm run build` 오류 없음
- Vercel Preview 배포 성공

---

### Phase 2: 견적서 UI 완성 + PDF 출력 + UI E2E 검증 (2026-04-15 ~ 2026-04-28)

#### 목표

파싱된 Notion 데이터를 브랜드화된 레이아웃으로 렌더링하고, 인쇄용 CSS로 PDF 저장이 정상 동작하도록 완성한다. Playwright MCP로 클라이언트 브라우저 시나리오 전체를 자동화 검증한다.

#### 세부 태스크

**[2-1] 견적서 렌더링 UI 완성 (F002, F005)**

- [ ] 공급자 헤더 영역
  - `PROVIDER_LOGO_URL` 환경변수 → `<img>` 렌더링
  - 로고 URL이 없을 때 회사명 텍스트 폴백 처리
  - 공급자 이름, 이메일, 전화, 주소 표시 (환경변수 기반)
- [ ] 견적서 메타 정보 영역
  - 견적서 제목, 클라이언트명, 클라이언트 이메일 표시
  - 발행일 / 유효기간 표시 (날짜 포맷: `YYYY년 MM월 DD일`)
  - 견적서 상태 배지: `초안` / `발송됨` / `만료됨` (shadcn/ui `Badge` 컴포넌트 활용)
- [ ] 견적 항목 테이블 (F005)
  - 항목명, 수량, 단가, 금액, 비고 컬럼 구성
  - `formatCurrency()` 함수: `currency` 필드 기반 KRW(`₩`) / USD(`$`) 포맷 처리
  - 소계 / 세금 / 총액 합계 행 렌더링 (소수점 처리 포함)
  - 항목 없음 케이스: "견적 항목이 없습니다" 빈 상태 메시지 표시
- [ ] 비고(notes) 영역: 줄바꿈 처리 (`whitespace-pre-wrap`) 확인
- [ ] PDF 다운로드 버튼: `window.print()` 호출 (클라이언트 컴포넌트 내 구현 확인)

**[2-2] 반응형 레이아웃 검증**

- [ ] 모바일(360px): 공급자/클라이언트 정보 그리드 1컬럼 처리
- [ ] 태블릿(768px): 2컬럼 레이아웃 전환 확인
- [ ] 데스크탑(1280px): 최대 너비 컨테이너 적용 확인
- [ ] 견적 항목 테이블 가로 스크롤: `overflow-x-auto` 처리 확인

**[2-3] 인쇄 CSS (`@media print`) 구현 (F003)**

- [ ] `app/globals.css`에 `@media print` 스타일 추가
  - Sticky 헤더 / PDF 다운로드 버튼 숨김 (`print:hidden`)
  - 배경색 제거 및 흰색 배경 강제 설정
  - 여백 최적화: `@page { margin: 20mm; }`
  - 테이블 헤더 각 페이지 반복: `thead { display: table-header-group; }`
  - 항목 행 페이지 중간 잘림 방지: `page-break-inside: avoid`
- [ ] Chrome / Safari / Firefox 세 브라우저에서 PDF 저장 테스트

**[2-4] 오류 페이지 UI 완성 (F010)**

- [ ] `app/not-found.tsx` 커스텀 페이지 작성
  - 안내 문구: "유효하지 않은 견적서 링크입니다."
  - 서비스 제공자 연락처 표시 (`PROVIDER_EMAIL` 환경변수 활용)
- [ ] 만료 오류 페이지: 만료일 표시 포함 (`expiry_date` 전달)
- [ ] 서버 오류 페이지: 기술 용어 없는 한국어 안내 문구
- [ ] 오류 유형별(404 / 410 / 500) 안내 메시지 사용자 친화적 문구 최종 검토

**[2-5] 로딩 UI 검토 (F011)**

- [ ] `loading.tsx` Skeleton 항목 수를 실제 데이터 구조에 맞게 조정
- [ ] Chrome DevTools 네트워크 조절(3G 시뮬레이션)에서 Skeleton 표시 확인

**[2-6] Playwright MCP E2E 테스트 — 견적서 UI 시나리오 (F002, F003, F005, F010, F011 대응)**

> UI 렌더링 구현([2-1] ~ [2-5])과 쌍으로 진행합니다. 실제 Notion 테스트 데이터를 연결한 상태에서 실행합니다.

- [ ] **시나리오 6: 유효한 토큰으로 견적서 페이지 접근 → 전체 렌더링 확인**
  - `/quote/{valid_token}` 브라우저 탐색
  - 페이지 타이틀 표시 확인
  - 공급자 이름 / 클라이언트명 텍스트 존재 확인
  - 견적 항목 테이블 행(row) 수 Notion 데이터와 일치 확인
  - 소계 / 세금 / 총액 금액 표시 확인
- [ ] **시나리오 7: 금액 계산 정확성 검증 (F005)**
  - `/quote/{valid_token}` 접근 (단가·수량 알려진 테스트 데이터)
  - 각 항목의 `금액 = 수량 × 단가` 계산 결과 DOM 텍스트 확인
  - `소계`, `세금 금액(소계 × 세율)`, `총액(소계 + 세금)` 계산값 확인
- [ ] **시나리오 8: 로딩 상태 표시 확인 (F011)**
  - `/quote/{valid_token}` 접근 직후 Skeleton UI 요소 DOM 존재 확인
  - 데이터 로딩 완료 후 Skeleton 제거 및 견적서 콘텐츠 표시 확인
- [ ] **시나리오 9: 유효하지 않은 토큰 → 오류 페이지 렌더링 확인 (F010)**
  - `/quote/invalid-token-xyz` 접근
  - 오류 안내 메시지 텍스트("유효하지 않은") 포함 여부 확인
  - 서비스 제공자 연락처 표시 확인
- [ ] **시나리오 10: 만료된 토큰 → 만료 오류 페이지 렌더링 확인 (F010)**
  - `/quote/{expired_token}` 접근
  - 만료 안내 문구 텍스트 존재 확인
  - 만료일(`expiry_date`) 텍스트 표시 확인
- [ ] **시나리오 11: 항목 없는 견적서 → 빈 상태 메시지 표시 확인**
  - `/quote/{empty_items_token}` 접근
  - "견적 항목이 없습니다" 빈 상태 메시지 DOM 존재 확인
- [ ] **시나리오 12: PDF 다운로드 버튼 클릭 → 인쇄 다이얼로그 트리거 확인 (F003)**
  - `/quote/{valid_token}` 접근 후 PDF 다운로드 버튼 클릭
  - `window.print` 호출 여부 확인 (Playwright `page.evaluate` 활용)
- [ ] **시나리오 13: 반응형 레이아웃 — 모바일 뷰포트 검증**
  - 뷰포트 360×800 설정 후 `/quote/{valid_token}` 접근
  - 페이지 레이아웃 깨짐 없음 스크린샷 캡처 및 확인
  - 테이블 가로 스크롤 동작 확인

**[2-7] 검증**

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] Vercel Preview 배포 성공

#### 기술적 고려사항

- `window.print()` 호출은 클라이언트 컴포넌트(`"use client"`)에서만 가능 — `quote-viewer.tsx`에 이미 적용됨
- `@media print` 스타일은 Tailwind v4의 `print:` 변형 유틸리티와 `globals.css` 직접 작성 병행 사용
- 외부 이미지 URL (Notion 이미지 등) 사용 시 `next.config.ts`의 `images.remotePatterns` 등록 필요
- `formatCurrency()` 함수는 `Intl.NumberFormat` API 활용 (브라우저 표준)

#### 완료 기준 (Definition of Done)

- 모바일 / 태블릿 / 데스크탑 세 뷰포트에서 레이아웃 깨짐 없음
- PDF 저장 시 버튼·헤더 숨김, 여백 정상, 항목 페이지 잘림 없음
- 오류 유형 3가지(404 / 410 / 500)에서 각각 안내 메시지 표시
- Playwright MCP E2E 시나리오 6~13 전체 통과
- `npm run lint` / `npm run build` 오류 없음

---

### Phase 3: 오류 처리 강화 + 성능 최적화 + Vercel 배포 (2026-04-29 ~ 2026-05-12)

#### 목표

프로덕션 배포 전 보안 요건 충족, 성능 목표 달성, 엣지 케이스 처리를 완료하고 Playwright MCP로 프로덕션 환경 최종 검증을 수행한다.

#### 세부 태스크

**[3-1] 보안 강화**

- [ ] HTTP 응답 헤더 보안 설정: `next.config.ts`의 `headers()` 추가
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `NOTION_API_KEY` 클라이언트 번들 노출 여부 빌드 결과물에서 최종 확인
- [ ] 열거 공격 방지 재검증: `NOT_FOUND`와 `INVALID_TOKEN` 모두 동일한 404 응답 구조 확인

**[3-2] 성능 최적화**

- [ ] LCP 측정: Vercel Speed Insights 또는 Chrome DevTools Lighthouse로 3초 이내 달성 확인
- [ ] Notion API 타임아웃 `AbortController` 10초 구현 최종 확인
- [ ] 공급자 로고 이미지 최적화: 외부 URL 사용 시 `loading="lazy"` 속성 추가 또는 `next/image` 전환 검토

**[3-3] 타입 안전성 개선**

- [ ] `route.ts`의 `any` 타입 → Notion API 응답 타입 가드 함수로 교체
  - `isNotionPage()`, `isNotionTableBlock()` 타입 가드 함수 작성
  - `eslint-disable @typescript-eslint/no-explicit-any` 주석 제거
- [ ] `QuoteData` 타입에 `currency` 필드 추가 및 `formatCurrency()` 함수와 연동 확인

**[3-4] 접근성 개선**

- [ ] 견적서 테이블에 `<caption>` 또는 `aria-label` 추가
- [ ] PDF 다운로드 버튼에 스크린 리더용 설명 추가 (`aria-label="견적서 PDF 저장"`)
- [ ] 오류 페이지에 `role="alert"` 추가

**[3-5] Playwright MCP E2E 테스트 — 보안·성능·엣지 케이스 시나리오**

> 보안 강화([3-1]) 및 오류 처리 구현과 쌍으로 진행합니다. Vercel Preview 환경에서 실행합니다.

- [ ] **시나리오 14: 보안 헤더 응답 확인**
  - `/api/quote/{valid_token}` 응답 헤더에 `X-Content-Type-Options: nosniff` 존재 확인
  - `X-Frame-Options: DENY` 존재 확인
- [ ] **시나리오 15: 환경변수 의존 동작 — 로고 없음 폴백 확인**
  - `PROVIDER_LOGO_URL` 미설정 환경에서 `/quote/{valid_token}` 접근
  - 로고 이미지 대신 회사명 텍스트 렌더링 확인
- [ ] **시나리오 16: Notion API 타임아웃 처리 확인**
  - Playwright 네트워크 인터셉트로 Notion API 응답을 10초 이상 지연 시뮬레이션
  - 서버 오류 안내 페이지(`NOTION_API_ERROR`) 렌더링 확인
- [ ] **시나리오 17: 모바일 PDF 저장 플로우 확인**
  - 뷰포트 375×812(iOS 크기) 설정 후 `/quote/{valid_token}` 접근
  - PDF 다운로드 버튼 노출 확인
  - 버튼 클릭 후 인쇄 다이얼로그 트리거 확인
- [ ] **시나리오 18: 전체 E2E 회귀 테스트 (Phase 1~2 시나리오 재실행)**
  - 시나리오 1~13 전체를 Vercel Preview 도메인 기준으로 재실행
  - 모든 시나리오 통과 확인

**[3-6] Vercel 프로덕션 배포**

- [ ] Vercel 프로젝트 환경변수 전체 등록 확인 (필수 7개 변수)
- [ ] 커스텀 도메인 설정 (있는 경우)
- [ ] HTTPS 강제 리디렉션 확인 (Vercel 기본 지원)
- [ ] Vercel Edge Network 배포 후 실제 도메인으로 수동 최종 검증

**[3-7] 최종 QA 체크리스트**

- [ ] 유효한 토큰 → 견적서 정상 표시
- [ ] 유효하지 않은 토큰 → 404 안내 페이지
- [ ] 만료된 토큰 → 만료 안내 페이지 (만료일 표시)
- [ ] Notion API 다운 시 → 서버 오류 안내 페이지
- [ ] 환경변수 누락 시 → 500 오류 응답
- [ ] 모바일에서 PDF 저장 플로우 동작 확인
- [ ] 견적 항목 0개인 경우 "견적 항목이 없습니다" 메시지 표시

**[3-8] 검증**

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] Vercel 프로덕션 배포 성공 및 실제 도메인 접근 확인

#### 기술적 고려사항

- Next.js 16 App Router에서 `headers()` API는 서버 컴포넌트 / Route Handler에서만 사용 가능
- Notion API는 간헐적 지연이 발생할 수 있어 타임아웃 처리가 프로덕션에서 필수
- `NEXT_PUBLIC_BASE_URL` 없이 서버 컴포넌트에서 내부 API를 직접 호출하는 방식으로 리팩터링 여부는 오픈 이슈 참조

#### 완료 기준 (Definition of Done)

- 모든 QA 체크리스트 항목 통과
- LCP 3초 이내 달성
- 보안 헤더 설정 완료
- Playwright MCP E2E 시나리오 14~18 전체 통과 (누적 시나리오 1~18 전체 통과)
- Vercel 프로덕션 배포 성공
- `npm run lint` / `npm run build` 오류 없음

---

### Phase 4+: MVP 이후 기능 (2026-05-13 이후)

PRD 8절에 정의된 향후 기능을 단계별로 추가합니다.

#### Phase 4-A: 관리 기능 (서비스 제공자 관점)

| 기능 | 설명 | 예상 복잡도 |
|------|------|------------|
| 서비스 제공자 로그인 | 이메일/소셜 로그인으로 대시보드 접근 | 높음 (Auth 스택 도입 필요) |
| 견적서 대시보드 | 발송한 견적서 목록 및 상태 일괄 관리 | 중간 |
| 견적서 상태 추적 | 클라이언트 링크 열람 시각 기록 | 중간 (자체 DB 도입 필요) |
| 자동 토큰 생성 | Notion Webhook 또는 버튼으로 토큰 자동 주입 | 높음 |

> ⚠️ 가정: Phase 4-A부터 자체 데이터베이스(PostgreSQL 등) 및 인증 스택이 도입됩니다. 이는 MVP 아키텍처와 큰 변경이므로 별도 기술 스펙 문서 작성을 권장합니다.

#### Phase 4-B: 클라이언트 인터랙션

| 기능 | 설명 |
|------|------|
| 온라인 승인 버튼 | 클라이언트가 웹에서 견적 승인 처리 |
| 전자 서명 | 견적서에 서명 추가 및 저장 |
| 수정 요청 | 클라이언트가 코멘트 남기기 |
| 이메일 자동 발송 | 링크가 포함된 견적서 이메일 자동 전송 |

#### Phase 4-C: 고급 기능

| 기능 | 설명 |
|------|------|
| 견적서 템플릿 | 재사용 가능한 항목 템플릿 관리 |
| 다국어 지원 | 영어/일본어 등 다국어 견적서 |
| 브랜딩 커스터마이징 | 색상, 폰트, 레이아웃 변경 |
| 서버사이드 PDF 생성 | Puppeteer/Playwright 기반 고품질 PDF |

---

## Playwright MCP E2E 테스트 시나리오 전체 요약

| 시나리오 | Phase | 대응 기능 | 분류 |
|----------|-------|-----------|------|
| 1: 정상 토큰 → 200 응답 검증 | 1 | F001, F004 | API |
| 2: 존재하지 않는 토큰 → 404 | 1 | F004 | API |
| 3: 만료된 토큰 → 410 | 1 | F004 | API |
| 4: 열거 공격 방지 검증 | 1 | F004 | API/보안 |
| 5: 항목 없는 견적서 → 빈 배열 처리 | 1 | F001 | API |
| 6: 유효한 토큰 → 전체 렌더링 확인 | 2 | F002 | UI |
| 7: 금액 계산 정확성 검증 | 2 | F005 | UI/비즈니스 로직 |
| 8: 로딩 상태 표시 확인 | 2 | F011 | UI |
| 9: 유효하지 않은 토큰 → 오류 페이지 | 2 | F010 | UI |
| 10: 만료된 토큰 → 만료 오류 페이지 | 2 | F010 | UI |
| 11: 항목 없는 견적서 → 빈 상태 메시지 | 2 | F002 | UI |
| 12: PDF 다운로드 버튼 → 인쇄 트리거 | 2 | F003 | UI |
| 13: 반응형 — 모바일 뷰포트 검증 | 2 | F002 | UI/반응형 |
| 14: 보안 헤더 응답 확인 | 3 | 비기능(보안) | 보안 |
| 15: 로고 없음 폴백 확인 | 3 | F002 | UI/엣지 케이스 |
| 16: Notion API 타임아웃 처리 확인 | 3 | F010 | 엣지 케이스 |
| 17: 모바일 PDF 저장 플로우 확인 | 3 | F003 | UI/모바일 |
| 18: 전체 회귀 테스트 (1~13 재실행) | 3 | 전체 | 회귀 |

---

## 리스크 및 완화 전략

| 리스크 | 영향도 | 발생 가능성 | 완화 전략 |
|--------|--------|------------|-----------|
| Notion API 응답 지연 / 다운 | 높음 | 중간 | 10초 타임아웃 + 사용자 친화적 오류 메시지; 60초 캐싱으로 API 의존도 감소; 시나리오 16으로 E2E 검증 |
| Notion 데이터베이스 스키마 변경 | 높음 | 낮음 | `.env.example`에 스키마 명세 문서화; 타입 가드 함수로 파싱 실패 조기 탐지 |
| 토큰 유출 / 무단 열람 | 높음 | 낮음 | UUID v4(32자) 사용 권장; 만료일 설정 강제; HTTPS 강제; 시나리오 4(열거 공격)로 E2E 검증 |
| `window.print()` 브라우저 호환성 | 중간 | 낮음 | Chrome/Safari/Firefox 교차 테스트; 시나리오 12·17로 E2E 검증; `@media print` CSS 표준 준수 |
| 견적 항목 파싱 방식 결정 지연 (옵션 A vs B) | 중간 | 중간 | Phase 1 초반에 옵션 A(테이블 블록)로 확정; MVP 완료 후 재검토; 시나리오 5·11로 빈 케이스 검증 |
| Vercel 환경변수 누락으로 인한 프로덕션 오류 | 중간 | 중간 | 배포 전 체크리스트에 환경변수 7개 항목 포함; 서버 시작 시 환경변수 검증 로직 추가 |
| 모바일에서 PDF 저장 UX 불량 | 낮음 | 높음 | iOS Safari의 `window.print()` 동작 확인; 시나리오 17로 E2E 검증; 모바일에서 "공유 → PDF 저장" 안내 문구 추가 검토 |
| E2E 테스트 실행 환경 의존성 | 낮음 | 중간 | Playwright MCP는 개발 서버 / Vercel Preview 모두 지원; 테스트용 Notion 데이터베이스를 별도 유지 |

---

## 진행 현황 추적

### 진행 상황 업데이트 방법

각 Phase 태스크의 체크박스를 완료 시 체크하고, Phase 완료 후 아래 완료 기준을 충족했는지 서명란에 기록합니다.

### 스프린트 리뷰 체크리스트

매 Phase 완료 시 다음 항목을 확인합니다:

- [ ] 해당 Phase의 모든 태스크 체크박스 완료
- [ ] 해당 Phase의 Playwright MCP E2E 시나리오 전체 통과
- [ ] `npm run lint` 오류 없음
- [ ] `npm run build` 오류 없음
- [ ] Vercel Preview 배포 성공 및 수동 테스트 완료
- [ ] 다음 Phase 태스크 목록 검토 및 우선순위 조정

---

## 의존성 및 전제조건

### 외부 의존성

| 의존 항목 | 필요 Phase | 비고 |
|-----------|-----------|------|
| Notion Integration 생성 및 API 키 발급 | Phase 1 시작 전 | Notion 계정 필요 |
| Notion 견적서 데이터베이스 생성 (테스트 데이터 포함) | Phase 1 | PRD 5절 스키마 기준; 정상/만료/빈 항목 케이스 3개 준비 |
| Vercel 프로젝트 생성 | Phase 1 | Vercel 계정 필요 |
| Playwright MCP 설정 | Phase 1 | E2E 테스트 실행 환경 |
| 커스텀 도메인 (선택) | Phase 3 | 없으면 `*.vercel.app` 사용 |

### 기능 간 의존성

```
[환경변수 세팅] → [Notion DB 생성 + 테스트 데이터] → [API Route 완성] → [API E2E (시나리오 1~5)]
                                                              ↓
                                                    [UI 렌더링 완성] → [UI E2E (시나리오 6~13)]
                                                              ↓
                                            [보안/성능 강화] → [최종 E2E (시나리오 14~18)] → [Vercel 배포]
```

---

## 오픈 이슈 / 명확화가 필요한 질문

| # | 질문 | 관련 Phase | 중요도 |
|---|------|-----------|--------|
| 1 | 견적 항목을 페이지 본문 테이블 블록(옵션 A)으로 관리할 것인가, 하위 데이터베이스(옵션 B)로 관리할 것인가? | Phase 1 | 높음 (API 파싱 로직에 직접 영향) |
| 2 | 캐싱 전략: 견적서 발송 후 Notion에서 수정이 얼마나 자주 발생하는가? (60초 캐싱 적용 여부) | Phase 1 | 중간 |
| 3 | `currency` 필드를 `QuoteData` 타입에 추가하고 다국어 통화 포맷을 MVP에서 지원할 것인가? | Phase 2 | 낮음 (현재 KRW만 사용 시 불필요) |
| 4 | 모바일에서 PDF 저장이 동작하지 않는 경우(iOS Safari 제한) 대체 UX를 제공할 것인가? | Phase 2 | 중간 |
| 5 | `NEXT_PUBLIC_BASE_URL` 환경변수 없이 서버 컴포넌트에서 내부 API를 직접 호출하는 방식으로 리팩터링할 것인가? | Phase 3 | 낮음 (현재 동작하지만 아키텍처 개선 여지 있음) |
| 6 | Playwright MCP E2E 테스트를 CI/CD (Vercel Preview 빌드 시) 자동 실행으로 연동할 것인가? | Phase 3 | 중간 (수동 실행으로 MVP 충분하나, 장기적으로 자동화 권장) |

---

*버전: v1.1 | 작성일: 2026-04-01 | Playwright MCP E2E 테스트 시나리오 18개 추가*
