# Architecture Plan (Option 2: Frontend-Only, Backend Unified)

## Goal
- `/frontend_react`를 순수 UI/상태 레이어로 유지하고 백엔드/DB는 Quadrakill(또는 Alps 서버)로 일원화.

## Principles
- API 호출은 adapter 인터페이스 뒤에 숨기고 구현체는 단일 백엔드만 사용.
- 타입/DTO는 공유 패키지(`packages/shared` 등)로 제공, 프론트는 그 패키지에만 의존.
- 로직-애셋 하드커플링 제거: 프롬프트/자산 관리 로직은 백엔드 서비스로 이동.

## Required Changes
- Remove direct asset-generation logic from `/frontend_react`; call unified backend endpoints (/wizard, /ai-2d, /generate).
- Introduce schema validators on backend; frontend trusts validated DTOs.
- Configure env: `VITE_API_TARGET` (or equivalent) mandatory; no default prod.

## Migration Steps
1) Define shared types package and publish (workspace link).
2) Replace current hardcoded fetches with single adapter impl pointing to unified backend (`src/api/engineAdapter.js`, `src/api/quadrakillAdapter.js`).
3) Update UI flows to consume backend-driven asset/state (plan -> generate -> apply).
4) Remove/flag legacy local-engine code paths.

## Testing
- Contract tests against unified backend stubs.
- UI integration tests for main flows (plan/generate/preview/apply).
