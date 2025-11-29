// Arcade.js

import React, { useState } from 'react';
import './Arcade.css';
import Header from '../../components/Header/Header';

const Arcade = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [games] = useState([
    {
      id: 1,
      title: '게임 1',
      creator: '크리에이터 1',
      image: 'https://via.placeholder.com/300x200',
      category: '액션',
    },
    {
      id: 2,
      title: '게임 2',
      creator: '크리에이터 2',
      image: 'https://via.placeholder.com/300x200',
      category: '퍼즐',
    },
    // ... 더 많은 게임 데이터 추가
  ]);

  const categories = ['전체', '액션', '퍼즐', '슈팅', '스포츠', '레이싱'];

  const toggleCategoryDropdown = () => {
    setIsCategoryOpen(!isCategoryOpen);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsCategoryOpen(false);
  };

  const filteredGames =
    selectedCategory === '전체'
      ? games
      : games.filter((game) => game.category === selectedCategory);

  return (
    <div className="arcade-page">
  <Header />

      <div className="header-section">
        <h1 className="page-title">이번 게임은 어떠신가요?</h1>
        <div className="category-dropdown">
          <button
            className="category-button"
            onClick={toggleCategoryDropdown}
          >
            {selectedCategory}
          </button>
          <ul className={`category-list ${isCategoryOpen ? 'open' : ''}`}>
            {categories.map((category) => (
              <li
                key={category}
                className="category-item"
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="game-grid">
        {filteredGames.map((game) => (
          <div key={game.id} className="game-card">
            <img
              src={game.image}
              alt={game.title}
              className="game-image"
            />
            <h3 className="game-title">{game.title}</h3>
            <p className="game-creator">by {game.creator}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Arcade;