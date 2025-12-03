import { quadrakillAdapter } from "./quadrakillAdapter";
import { getEngineAdapter } from "./engineAdapter";

const normalizeTarget = (target) => {
  if (typeof target === "string") {
    return { projectId: target || "", gameName: "" };
  }
  if (!target) {
    return { projectId: "", gameName: "" };
  }

  return {
    projectId: target.projectId || target.project_id || "",
    gameName: target.gameName || target.game_name || "",
    version: target.version,
    data: target.data,
    payload: target.payload,
  };
};

// spec 호출만 담당, response 후처리는 하지 않음
export const getGameSpec = (projectId) =>
  quadrakillAdapter.projects.draft(projectId);

// 선택한 게임 버전 복원 요청
export const restoreGameVersion = (target, version) =>
  quadrakillAdapter.legacy.restoreVersion({
    ...normalizeTarget(target),
    version,
  });

// 스냅샷 로그 조회
export const getSnapshotLog = (target) =>
  quadrakillAdapter.legacy.snapshotLog(normalizeTarget(target));

// 게임 데이터 조회 (projectId 우선, 레거시 fallback)
export const getGameData = (target) => {
  const ctx = normalizeTarget(target);
  if (ctx.projectId) {
    return quadrakillAdapter.projects.draft(ctx.projectId);
  }
  return quadrakillAdapter.legacy.gameData(ctx);
};

// 채팅 기록 조회 (projectId 우선)
export const getChat = (target) => {
  const ctx = normalizeTarget(target);
  if (ctx.projectId) {
    return quadrakillAdapter.projects.draft(ctx.projectId);
  }
  return quadrakillAdapter.legacy.chat(ctx);
};

// 게임 에셋 조회 (projectId 우선)
export const getGameAssets = (target) =>
  quadrakillAdapter.assets.list(normalizeTarget(target));

// 게임 에셋 교체
export const replaceAsset = (target, previewItem, file) => {
  const ctx = normalizeTarget(target);
  const engine = getEngineAdapter();
  return engine.assets.upload({
    file,
    type: previewItem.type || "raw",
    projectId: ctx.projectId || ctx.gameName || "common",
    name: previewItem.name || file?.name || "upload",
  });
};

// 게임 데이터 업데이트
export const updateGameData = (target, data) => {
  const ctx = normalizeTarget(target);
  if (ctx.projectId) {
    return quadrakillAdapter.projects.updateDraft(ctx.projectId, data);
  }
  return quadrakillAdapter.legacy.dataUpdate({ ...ctx, data });
};

// 에러 배치 전송
export const sendErrorBatch = (
  target,
  gameErrorBatch,
  gameVersion = "1.0.1",
) => {
  const ctx = normalizeTarget(target);
  return quadrakillAdapter.legacy.clientError({
    type: "error-batch",
    project_id: ctx.projectId,
    game_name: ctx.gameName || "",
    game_version: gameVersion,
    collected_at: new Date().toISOString(),
    error_count: gameErrorBatch.error_count || 0,
    error_report: gameErrorBatch.error_report || "",
    errors: [],
  });
};

// 게임 상태 되돌리기
export const revertGame = (target) =>
  quadrakillAdapter.legacy.revert(normalizeTarget(target));

// 코드 메시지 처리 요청
export const processCodeMessage = (message, target, contextEntityId = null) => {
  const ctx = normalizeTarget(target);
  // Route through Quadrakill generate endpoint for unified backend
  const engine = getEngineAdapter();
  return engine.generate.run(message, {
    task_type: "CHAT",
    project_id: ctx.projectId || ctx.gameName,
    context_entity_id: contextEntityId,
  });
};

// 질문 답변 전송
export const submitAnswer = (questionId, answer) =>
  quadrakillAdapter.legacy.answer(questionId, answer);

// QnA 제출
export const submitQnA = (target, payload) =>
  quadrakillAdapter.legacy.qna({ ...normalizeTarget(target), payload });

/**
 * 서버로 spec-question 요청
 * @param {string} gameName - 게임 이름
 * @param {string} message - 질문 메시지
 * @returns {Promise} Axios response
 */
export const specQuestion = (target, message) =>
  quadrakillAdapter.legacy.specQuestion(normalizeTarget(target), message);
