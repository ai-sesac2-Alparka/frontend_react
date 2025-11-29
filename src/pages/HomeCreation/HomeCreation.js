import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './HomeCreation.css';

function HomeCreation() {
    const navigate = useNavigate();
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedMood, setSelectedMood] = useState('');

    // 스크롤 함수
    const scrollToGameCreator = () => {
        const element = document.getElementById('game-creator');
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    };

    // 태그 선택
    const handleTagClick = (type, value) => {
        if (type === 'genre') {
            setSelectedGenre(selectedGenre === value ? '' : value);
        } else {
            setSelectedMood(selectedMood === value ? '' : value);
        }
    };

    // CREATE 버튼
    const handleCreate = () => {
        if (!selectedGenre && !selectedMood) {
            alert('장르나 분위기를 최소 하나 선택해주세요!');
            return;
        }

        // Customize 페이지로 이동
        navigate('/customize/step1', {
            state: {
                order: `${selectedMood} ${selectedGenre} 게임`,
            },
        });
    };

    // 완성된 주문서 텍스트 계산 (둘 다 비어있으면 빈 문자열)
    const orderText = (() => {
        const parts = [selectedMood, selectedGenre].filter(Boolean).join(' ').trim();
        return parts ? `${parts} 게임` : '';
    })();

    return (
        <div className="home-creation-page">
            <Header />

            <main className="main-content">
                {/* 히어로 섹션 */}
                <section className="hero-section">
                    <div className="hero-logo">
                        <img src="/images/alpaca.png" alt="AIparkA Logo" />
                    </div>
                    
                    <h1 className="hero-title">당신의 손끝에서 만들어지는 세계</h1>
                    
                    <p className="hero-subtitle">
                        머릿속 상상이 게임으로 뚝딱!️<br/>
                        AIparkA가 당신의 상상을 현실로 소환해 드립니다. 🧙‍♂️
                    </p>
                    
                    <button className="btn-hero-cta" onClick={scrollToGameCreator}>
                        ⚡지금 바로 시작하기
                    </button>
                </section>

                {/* 게임 쇼케이스 */}
                <section className="game-showcase">
                    <div className="game-showcase-grid">
                        {[
                            { title: '테트리스', image: 'https://placehold.co/257x301' },
                            { title: '갤러그', image: 'https://placehold.co/257x301' },
                            { title: '지뢰 찾기', image: 'https://placehold.co/257x301' },
                            { title: '점프맵', image: 'https://placehold.co/257x301' }
                        ].map((game, index) => (
                            <div key={index} className="game-card" onClick={() => navigate('/play/1')}>
                                <div className="game-card-image">
                                    <img src={game.image} alt={game.title} />
                                </div>
                                <div className="game-card-info">
                                    <h3 className="game-card-title">{game.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 게임 생성 섹션 */}
                <section id="game-creator" className="game-creator-section">
                    <h2 className="section-title-creator">
                        오늘은 어떤 게임을<br/>만들어볼까요?
                    </h2>
                    
                    <div className="creator-box">
                        {/* 장르 선택 */}
                        <div className="option-group">
                            <h3 className="option-title">장르</h3>
                            <div className="option-tags">
                                {['🧠 두뇌 퍼즐', '🏃 액션/런', '👆 단순 클릭', '🔫 슈팅', 
                                  '❓퀴즈', '🏪 타이쿤', '🛡️ 디펜스', '🎵 리듬/음악'].map(genre => (
                                    <button
                                        key={genre}
                                        className={`tag-btn ${selectedGenre === genre ? 'active' : ''}`}
                                        onClick={() => handleTagClick('genre', genre)}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 분위기 선택 */}
                        <div className="option-group">
                            <h3 className="option-title">분위기</h3>
                            <div className="option-tags">
                                {['🎄 크리스마스', '🧟 좀비/호러', '👾 레트로 픽셀', '☔ 비오는 날',
                                  '🐱 귀여운 동물', '👔 직장인 공감', '🌃 사이버펑크', '🏰 판타지'].map(mood => (
                                    <button
                                        key={mood}
                                        className={`tag-btn ${selectedMood === mood ? 'active' : ''}`}
                                        onClick={() => handleTagClick('mood', mood)}
                                    >
                                        {mood}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 완성된 주문서 & CREATE 버튼 */}
                        <div className="creator-footer">
                            <div className="order-summary">
                                <p className="order-label">완성된 주문서</p>
                                <p className="order-text">{orderText}</p>
                            </div>

                            <button className="btn-create" onClick={handleCreate}>
                                CREATE!
                            </button>
                        </div>
                    </div>
                </section>

                {/* 명예의 전당 */}
                <section className="hall-of-fame">
                    <div className="trophy-icon">🎖️</div>
                    
                    <h2 className="section-title-fame">명예의 전당</h2>
                    
                    <p className="hall-subtitle">
                        내가 만든 게임을 다른 사람이 하면 수익이 쌓여요! 💰
                    </p>
                    
                    <button className="btn-more" onClick={() => navigate('/arcade')}>
                        더보기
                    </button>
                    
                    <div className="fame-games-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="fame-game-item" onClick={() => navigate('/play/1')}>
                                <div className="fame-game-image">
                                    <img src="https://placehold.co/605x372" alt={`게임 ${i}`} />
                                </div>
                                <div className="fame-game-info">
                                    <h3 className="fame-game-title">김대리의 월급 루팡</h3>
                                    <p className="fame-game-author">직장인 A</p>
                                    <div className="fame-game-earnings">+15,400원</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default HomeCreation;