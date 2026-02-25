import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

const createFood = (snake) => {
  while (true) {
    const food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    const hitsSnake = snake.some((segment) => segment.x === food.x && segment.y === food.y);
    if (!hitsSnake) return food;
  }
};

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const directionRef = useRef({ x: 1, y: 0 });
  const [snake, setSnake] = useState([
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ]);
  const [food, setFood] = useState(() => createFood([
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 }
  ]));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = () => {
    const initialSnake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    directionRef.current = { x: 1, y: 0 };
    setSnake(initialSnake);
    setFood(createFood(initialSnake));
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'r') {
        resetGame();
        return;
      }

      const { x, y } = directionRef.current;
      if (event.key === 'ArrowUp' && y !== 1) directionRef.current = { x: 0, y: -1 };
      if (event.key === 'ArrowDown' && y !== -1) directionRef.current = { x: 0, y: 1 };
      if (event.key === 'ArrowLeft' && x !== 1) directionRef.current = { x: -1, y: 0 };
      if (event.key === 'ArrowRight' && x !== -1) directionRef.current = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return undefined;

    const interval = setInterval(() => {
      setSnake((current) => {
        const dir = directionRef.current;
        const head = current[0];
        const next = { x: head.x + dir.x, y: head.y + dir.y };

        const hitsWall =
          next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE;
        const hitsSelf = current.some((segment) => segment.x === next.x && segment.y === next.y);
        if (hitsWall || hitsSelf) {
          setGameOver(true);
          return current;
        }

        const nextSnake = [next, ...current];
        if (next.x === food.x && next.y === food.y) {
          setScore((prev) => prev + 1);
          setFood(createFood(nextSnake));
        } else {
          nextSnake.pop();
        }

        return nextSnake;
      });
    }, 130);

    return () => clearInterval(interval);
  }, [food, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    context.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i <= GRID_SIZE; i += 1) {
      context.fillRect(i * CELL_SIZE, 0, 1, CANVAS_SIZE);
      context.fillRect(0, i * CELL_SIZE, CANVAS_SIZE, 1);
    }

    context.fillStyle = '#6bd5ff';
    snake.forEach((segment, index) => {
      const size = index === 0 ? CELL_SIZE : CELL_SIZE - 2;
      const offset = index === 0 ? 0 : 1;
      context.fillRect(
        segment.x * CELL_SIZE + offset,
        segment.y * CELL_SIZE + offset,
        size,
        size
      );
    });

    context.fillStyle = '#ff7dd8';
    context.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }, [snake, food]);

  return (
    <div className="terminal-game">
      <div className="terminal-game__header">
        <span>Snake</span>
        <span className="terminal-game__score">Score: {score}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="terminal-game__canvas"
      />
      <div className="terminal-game__hint">
        Arrows to move. Press R to restart. Esc to exit.
      </div>
      {gameOver && <div className="terminal-game__overlay">Game Over</div>}
    </div>
  );
};

export default SnakeGame;
