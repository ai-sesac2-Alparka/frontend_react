# GameContext 사용 방법

## 설정 완료 ✅

Context API가 설정되었습니다. 이제 모든 컴포넌트에서 `gameTitle`, `gameData`, `assets`를 사용할 수 있습니다.

## 사용 예시

### 1. 게임 타이틀 읽기

```javascript
import { useGame } from "../../contexts/GameContext";

const MyComponent = () => {
  const { gameTitle } = useGame();

  return <h1>{gameTitle}</h1>;
};
```

### 2. 게임 타이틀 수정하기

```javascript
import { useGame } from "../../contexts/GameContext";

const MyComponent = () => {
  const { gameTitle, setGameTitle } = useGame();

  return (
    <input value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} />
  );
};
```

### 3. 여러 상태 동시에 사용

```javascript
import { useGame } from "../../contexts/GameContext";

const MyComponent = () => {
  const { gameTitle, gameData, assets, setAssets } = useGame();

  return (
    <div>
      <h1>{gameTitle}</h1>
      <p>에셋 개수: {assets.length}</p>
    </div>
  );
};
```

## 사용 가능한 컴포넌트

다음 컴포넌트들에서 `useGame()` 훅을 사용할 수 있습니다:

- Header
- AssetManager
- ChatPanel
- DataEditor
- SnapshotTree
- 기타 GameStudio 하위의 모든 컴포넌트
