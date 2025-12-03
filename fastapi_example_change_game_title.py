# FastAPI 예제: /change-game-title 엔드포인트

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 요청 바디 모델 정의
class ChangeGameTitleRequest(BaseModel):
    game_name: str  # 게임 고유 ID
    new_title: str  # 새로운 게임 타이틀


@app.get("/get-game-title")
async def get_game_title(game_name: str):
    """
    게임 타이틀 조회
    
    Args:
        game_name: 게임 고유 ID (쿼리 파라미터)
    
    Returns:
        dict: 게임 타이틀 정보
    """
    try:
        if not game_name or not game_name.strip():
            raise HTTPException(status_code=400, detail="게임 이름이 필요합니다.")
        
        # 실제로는 데이터베이스나 파일에서 타이틀 조회
        # 예시: JSON 파일에서 읽기
        game_dir = Path(f"./games/{game_name}")
        metadata_file = game_dir / "metadata.json"
        
        if metadata_file.exists():
            with open(metadata_file, "r", encoding="utf-8") as f:
                metadata = json.load(f)
                title = metadata.get("title", game_name)  # 기본값으로 game_name 사용
        else:
            # 메타데이터 파일이 없으면 game_name을 기본 타이틀로 사용
            title = game_name
        
        return {
            "title": title,
            "game_name": game_name
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # 에러 발생 시 기본값으로 game_name 반환
        return {
            "title": game_name,
            "game_name": game_name
        }


@app.post("/change-game-title")
async def change_game_title(request: ChangeGameTitleRequest):
    """
    게임 타이틀 변경 요청을 처리합니다.
    
    Args:
        request: ChangeGameTitleRequest
            - game_name: 게임 고유 ID
            - new_title: 새로운 게임 타이틀
    
    Returns:
        dict: 성공 메시지
    """
    try:
        game_name = request.game_name
        new_title = request.new_title
        
        # 유효성 검사
        if not game_name or not game_name.strip():
            raise HTTPException(status_code=400, detail="게임 이름이 필요합니다.")
        
        if not new_title or not new_title.strip():
            raise HTTPException(status_code=400, detail="새로운 타이틀이 필요합니다.")
        
        # 여기서 실제 데이터베이스 또는 파일 시스템에 타이틀 저장
        # 예: 게임 메타데이터 파일 업데이트
        # update_game_metadata(game_name, {"title": new_title})
        
        print(f"게임 '{game_name}'의 타이틀을 '{new_title}'로 변경")
        
        return {
            "status": "success",
            "message": "게임 타이틀이 성공적으로 변경되었습니다.",
            "game_name": game_name,
            "new_title": new_title
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"타이틀 변경 중 오류 발생: {str(e)}"
        )


# 실제 구현 예시 (JSON 파일에 저장하는 경우)
import json
import os
from pathlib import Path

def update_game_metadata(game_name: str, new_title: str):
    """
    게임 메타데이터 파일에 타이틀 업데이트
    """
    # 게임 디렉토리 경로
    game_dir = Path(f"./games/{game_name}")
    metadata_file = game_dir / "metadata.json"
    
    # 디렉토리가 없으면 생성
    game_dir.mkdir(parents=True, exist_ok=True)
    
    # 기존 메타데이터 로드 (있으면)
    if metadata_file.exists():
        with open(metadata_file, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    else:
        metadata = {}
    
    # 타이틀 업데이트
    metadata["title"] = new_title
    metadata["game_name"] = game_name
    
    # 저장
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    return metadata


# 더 완전한 버전 (메타데이터 파일 사용)
@app.post("/change-game-title-v2")
async def change_game_title_v2(request: ChangeGameTitleRequest):
    """
    게임 타이틀 변경 (메타데이터 파일에 저장)
    """
    try:
        if not request.game_name or not request.new_title.strip():
            raise HTTPException(status_code=400, detail="유효하지 않은 입력")
        
        # 메타데이터 업데이트
        metadata = update_game_metadata(request.game_name, request.new_title)
        
        return {
            "status": "success",
            "message": "게임 타이틀이 성공적으로 변경되었습니다.",
            "data": metadata
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 데이터베이스 사용 예시 (SQLAlchemy)
"""
from sqlalchemy.orm import Session
from database import get_db
from models import Game

@app.post("/change-game-title-db")
async def change_game_title_db(
    request: ChangeGameTitleRequest,
    db: Session = Depends(get_db)
):
    # 게임 찾기
    game = db.query(Game).filter(Game.game_name == request.game_name).first()
    
    if not game:
        raise HTTPException(status_code=404, detail="게임을 찾을 수 없습니다.")
    
    # 타이틀 업데이트
    game.title = request.new_title
    db.commit()
    db.refresh(game)
    
    return {
        "status": "success",
        "message": "타이틀이 변경되었습니다.",
        "game": {
            "game_name": game.game_name,
            "title": game.title
        }
    }
"""


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


"""
사용 예제:

1. 서버 실행:
   uvicorn filename:app --reload

2. 타이틀 조회:
   GET http://localhost:8000/get-game-title?game_name=test_game
   
   응답:
   {
     "title": "My Game Title",
     "game_name": "test_game"
   }

3. 타이틀 변경:
   POST http://localhost:8000/change-game-title
   
   Request Body:
   {
     "game_name": "550e8400-e29b-41d4-a716-446655440000",
     "new_title": "My Awesome Game"
   }
   
   응답:
   {
     "status": "success",
     "message": "게임 타이틀이 성공적으로 변경되었습니다.",
     "game_name": "550e8400-e29b-41d4-a716-446655440000",
     "new_title": "My Awesome Game"
   }

4. curl 테스트:
   # 조회
   curl "http://localhost:8000/get-game-title?game_name=test_game"
   
   # 변경
   curl -X POST http://localhost:8000/change-game-title \
     -H "Content-Type: application/json" \
     -d '{"game_name": "test_game", "new_title": "New Title"}'
"""
