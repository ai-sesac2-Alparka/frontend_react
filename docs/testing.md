# Testing Plan (frontend_react)

## 목표
- projectId 기반 흐름을 기본값으로 하는 통합 시나리오 테스트를 추가한다.
- 어댑터 계약(메타 필드 포함)을 단위/계약 테스트로 검증한다.

## 추천 시나리오 (Vitest + msw, Playwright)
1) 프로젝트 확보 플로우 (상태: 미구현, 모킹 필요)
   - `GET /projects/resolve?title=...&create_if_missing=true` 모킹 → projectId 설정 확인.
2) 자산 업로드/리스트/교체 (상태: 미구현, 설계 완료)
   - 단위: `/upload` 응답 메타(`project_id`, `asset_type`, `storage_path`, `metadata.checksum_sha256`) 보존 확인, `/assets` 리스트 메타 표시 검증.
   - 교체 후 `v` 스탬프 적용으로 캐시 무효화 확인.
   - E2E(Playwright): (a) resolve로 projectId 확보 → (b) upload 호출(mock) → (c) UI 리스트에 타입/경로/체크섬 표시 확인 → (d) replace 호출(mock) 후 스냅샷/게임데이터 리프레시 확인 → (e) restore(mock) 호출로 롤백 시 UI가 다시 리스트/데이터를 반영하는지 확인.
3) 스냅샷/복원 (상태: 미구현, 설계 완료)
   - `/snapshot-log`, `/restore-version`, `/game_data` 모킹 → versions 키 사용을 포함한 상태 동기화 검증.
4) 채팅/코드 메시지 (상태: 미구현, 설계 완료)
   - `project_id`가 `generate` 컨텍스트에 전달되는지 확인; CHAT task_type 모킹.

## 설정
- Vitest + jsdom + msw 추천. e2e는 Playwright로 upload→list→replace→restore 경로를 실행.
- 환경 변수: `VITE_API_BASE`, `VITE_BACKEND_URL`, `VITE_ENGINE`, `BASE_URL`.

## 커버리지 기준
- 어댑터 함수별 happy-path + 에러 경로 1개 이상.
- 주요 페이지(GameStudio) 로드/탭 전환/자산 리스트 렌더 검증.
