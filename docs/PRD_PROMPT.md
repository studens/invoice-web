# MVP PRD 메타 프롬프트 — Notion 기반 견적서 웹 뷰어

> **사용법**: 아래 프롬프트를 Claude Code에 그대로 붙여넣으면 PRD 문서가 생성됩니다.
> 꺾쇠(`< >`) 안의 값은 실제 프로젝트 정보로 교체하세요.

---

## 메타 프롬프트 (복사해서 사용)

```
당신은 시니어 프로덕트 매니저입니다.

아래 프로젝트 컨텍스트를 바탕으로 MVP PRD 문서를 작성해 주세요.

## 프로젝트 컨텍스트

- **프로젝트명**: <프로젝트명 입력>
- **작성일**: <YYYY-MM-DD>
- **작성자**: <작성자 이름>
- **기술 스택**:
  - Frontend: Next.js 16 App Router, TypeScript, Tailwind CSS v4, shadcn/ui
  - 데이터 소스: Notion API (견적서 원본 저장소)
  - PDF 생성: <사용할 라이브러리 예: react-pdf / puppeteer / html2canvas+jsPDF>
  - 배포: <Vercel / 자체 서버>

## 제품 개요

노션(Notion) 데이터베이스에 입력된 견적서 데이터를
클라이언트(고객)가 고유 URL로 웹에서 확인하고, PDF로 다운로드할 수 있는 서비스.

## 핵심 사용자 시나리오

1. **공급자(사용자)**: 노션 데이터베이스에 견적서 항목을 입력한다.
2. **시스템**: 노션 API로 데이터를 읽어 고유 URL(`/invoice/[id]`)을 생성한다.
3. **클라이언트(고객)**: 공유받은 URL로 견적서를 웹 브라우저에서 확인한다.
4. **클라이언트(고객)**: "PDF 다운로드" 버튼을 눌러 견적서를 저장한다.

## PRD 문서에 포함할 섹션

다음 8개 섹션을 순서대로 작성해 주세요.

### 1. Executive Summary
- 제품 한 줄 설명
- 해결하는 문제 (공급자/클라이언트 관점 각각)
- MVP 범위 명확화 (In-scope / Out-of-scope)

### 2. 사용자 및 이해관계자
- 퍼소나 2개: 공급자(서비스 운영자), 클라이언트(견적 수령인)
- 각 퍼소나별 목표, 불편함(Pain Point), 성공 기준

### 3. 핵심 기능 요구사항 (Functional Requirements)
다음 기능을 User Story + 수용 기준(Acceptance Criteria) 형식으로 작성:

- **F-01 노션 데이터 연동**
  - 노션 데이터베이스 → API 폴링 또는 웹훅으로 견적서 데이터 수신
  - 필수 필드: 견적번호, 발행일, 유효기간, 공급자 정보, 클라이언트 정보, 품목 리스트(품목명/수량/단가/금액), 세금, 합계, 메모

- **F-02 견적서 웹 뷰어**
  - URL: `/invoice/[notionPageId]`
  - 반응형 레이아웃 (모바일/태블릿/데스크톱)
  - 견적서 상태 표시 (발행됨 / 만료됨 / 승인됨)
  - 만료된 견적서 접근 시 안내 메시지

- **F-03 PDF 다운로드**
  - "PDF 다운로드" 버튼 클릭 → 견적서 PDF 파일 저장
  - 파일명 형식: `견적서_[견적번호]_[YYYY-MM-DD].pdf`
  - PDF 레이아웃은 웹 뷰와 동일한 디자인 유지
  - 한글 폰트 지원 필수

- **F-04 링크 공유 보안 (선택)**
  - 고유 토큰 기반 URL 또는 노션 페이지 ID 직접 사용 여부 결정
  - 만료일 이후 접근 차단

### 4. 비기능 요구사항 (Non-Functional Requirements)
- 성능: 견적서 페이지 LCP < 2.5초
- 보안: 노션 API 키 서버 사이드 전용, 환경 변수 관리
- 접근성: WCAG 2.1 AA 수준
- 브라우저 지원: Chrome / Safari / Edge 최신 2버전

### 5. 데이터 모델
다음 필드를 포함한 `Invoice` 타입 정의를 TypeScript 인터페이스로 작성:
- 기본 정보 (id, invoiceNumber, status, issuedAt, expiresAt)
- 공급자 정보 (supplier: name, businessNumber, address, contact)
- 클라이언트 정보 (client: name, businessNumber, address, contact)
- 품목 리스트 (items: Array<{ name, quantity, unitPrice, amount }>)
- 금액 정보 (subtotal, taxRate, taxAmount, total)
- 기타 (memo, currency, notionPageId)

### 6. 기술 아키텍처
- 시스템 다이어그램 (텍스트 기반 ASCII 또는 Mermaid)
- 주요 컴포넌트:
  - `app/invoice/[id]/page.tsx` — 서버 컴포넌트, 노션 API 호출
  - `components/invoice/InvoiceView.tsx` — 웹 렌더링용 컴포넌트
  - `components/invoice/PdfDocument.tsx` — PDF 렌더링용 컴포넌트
  - `lib/notion.ts` — 노션 API 클라이언트
  - `lib/invoice.ts` — 노션 응답 → Invoice 타입 변환 로직
- 노션 API 호출 전략: ISR(Incremental Static Regeneration) 또는 서버 사이드 렌더링 선택 근거

### 7. MVP 개발 로드맵
다음 4단계로 구성된 Sprint 계획 작성 (각 Sprint 1주 기준):

| Sprint | 목표 | 주요 태스크 |
|--------|------|------------|
| Sprint 1 | 노션 연동 + 기본 뷰어 | 노션 API 연결, 데이터 파싱, `/invoice/[id]` 라우트 |
| Sprint 2 | UI 완성 | InvoiceView 컴포넌트, 반응형 스타일, 상태 표시 |
| Sprint 3 | PDF 다운로드 | PDF 라이브러리 통합, 한글 폰트, 다운로드 버튼 |
| Sprint 4 | 품질 & 배포 | 에러 핸들링, 보안 검토, Vercel 배포, 도메인 연결 |

### 8. 성공 지표 (Success Metrics)
- 클라이언트가 링크 수신 후 PDF 다운로드까지 완료하는 전환율 > 80%
- 견적서 페이지 로딩 시간 < 2초 (P95)
- PDF 생성 시간 < 5초
- 노션 API 오류로 인한 페이지 실패율 < 1%

---

## 출력 형식 지침

- 마크다운 형식으로 작성
- 저장 경로: `docs/PRD.md`
- 각 기능 요구사항은 `FR-XX` 코드로 식별
- 수용 기준은 Given-When-Then 형식 사용
- 기술 선택에 대한 근거(Rationale)를 짧게 포함
- 한국어로 작성, 기술 용어는 영문 병기

지금 바로 PRD 문서 전체를 `docs/PRD.md`에 작성해 주세요.
```

---

## 사용 가이드

### 1단계 — 컨텍스트 채우기
메타 프롬프트 내 `< >` 항목을 실제 값으로 교체합니다.

| 항목 | 예시 |
|------|------|
| `<프로젝트명>` | `invoice-web` |
| `<YYYY-MM-DD>` | `2026-03-31` |
| `<작성자 이름>` | `홍길동` |
| `<PDF 라이브러리>` | `@react-pdf/renderer` |
| `<배포>` | `Vercel` |

### 2단계 — Claude Code에 실행
```bash
# Claude Code 터미널에서 바로 실행
/pdca plan invoice-viewer
```
또는 메타 프롬프트 전체를 Claude Code 채팅창에 붙여넣기.

### 3단계 — 생성된 PRD 검증
```bash
# 갭 분석으로 PRD 완성도 확인
/pdca analyze invoice-viewer
```

---

## 참고 기술 스택 결정 체크리스트

PDF 생성 라이브러리 선택 기준:

| 라이브러리 | 한글 지원 | 서버 렌더링 | 파일 크기 | 추천 상황 |
|-----------|----------|------------|---------|---------|
| `@react-pdf/renderer` | ✅ (폰트 임베드) | ✅ | 소 | **MVP 추천** — React 컴포넌트 방식 |
| `puppeteer` | ✅ | ✅ | 대 | 픽셀 퍼펙트 필요 시 |
| `html2canvas + jsPDF` | ⚠️ (설정 필요) | ❌ (클라이언트) | 중 | 클라이언트 사이드 필요 시 |

> MVP에는 `@react-pdf/renderer`를 권장합니다.
