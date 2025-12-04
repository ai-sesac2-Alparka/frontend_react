from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# 요청 바디 모델 정의
class AssetModificationRequest(BaseModel):
    game_name: str
    asset_name: str
    prompt: str

# 응답 모델 정의 (선택 사항)
class AssetModificationResponse(BaseModel):
    status: str
    reply: str
    # 필요한 경우 변경된 에셋 정보 등을 포함할 수 있습니다.

@app.post("/modify-asset", response_model=AssetModificationResponse)
async def modify_asset(request: AssetModificationRequest):
    """
    에셋 수정 요청을 처리하는 API 엔드포인트 예제
    """
    print(f"게임: {request.game_name}")
    print(f"에셋: {request.asset_name}")
    print(f"요청 프롬프트: {request.prompt}")

    try:
        # 1. 여기서 실제 AI 모델을 호출하거나 이미지 처리를 수행합니다.
        # 예: ai_service.modify_image(request.game_name, request.asset_name, request.prompt)
        
        # (시뮬레이션) 처리 시간 대기
        # import time
        # time.sleep(2)

        # 2. 처리 결과 메시지 생성
        result_message = f"'{request.asset_name}' 에셋이 '{request.prompt}' 요청에 따라 수정되었습니다."

        return AssetModificationResponse(
            status="success",
            reply=result_message
        )

    except Exception as e:
        # 에러 처리
        raise HTTPException(status_code=500, detail=str(e))

# 실행 방법: uvicorn fastapi_example_modify_asset:app --reload
