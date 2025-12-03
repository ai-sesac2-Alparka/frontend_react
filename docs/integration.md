# Integration Plan (Option 1: Adapter)

## Goal
- `/frontend_react`에서 Quadrakill/Alps 백엔드를 선택적으로 붙일 수 있는 어댑터 계층 추가.

## Adapter Design
- `src/api/adapter.ts`: interface EngineAdapter { baseUrl; projects; wizard; ai2d; generate; }.
- Implementations: `QuadrakillAdapter`, `AlpsAdapter` using env `VITE_API_TARGET`/`API_BASE`.
- DTO 타입은 shared 패키지 또는 로컬 타입으로 최소화 중복.

## Routing
- All fetch calls go through adapter; engine selection via env or runtime selector.
- Non-200 응답은 domain error로 매핑, JSON 우선, 비-JSON은 status+snippet 노출.

## Config
- Env: `VITE_API_TARGET`, `ENGINE=quadrakill|alps`.
- Build-time guard: fail if base URL missing in production.
- URL 파라미터: `?projectId=...&gameName=...` 로 스튜디오 초기 컨텍스트 주입. `projectId` 우선, 없으면 `gameName`을 fallback으로 사용.

## Testing
- Adapter unit tests with mocked fetch; contract tests per backend spec.
