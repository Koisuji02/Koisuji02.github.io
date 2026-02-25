import { useEffect, useRef, useState } from 'react';

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 18;
const CANVAS_WIDTH = COLS * CELL_SIZE;
const CANVAS_HEIGHT = ROWS * CELL_SIZE;

const TETROMINOES = [
  { shape: [[1, 1, 1, 1]], color: '#6bd5ff' },
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffe66b'
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#ff7dd8'
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#7df2c7'
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#ffad69'
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#b28dff'
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#4fd1c5'
  }
];

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const rotate = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      rotated[x][rows - 1 - y] = matrix[y][x];
    }
  }
  return rotated;
};

const randomPiece = () => {
  const item = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  return {
    shape: item.shape,
    color: item.color
  };
};

const hasCollision = (board, piece, position) => {
  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;
      const boardX = position.x + x;
      const boardY = position.y + y;
      if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true;
      if (boardY >= 0 && board[boardY][boardX]) return true;
    }
  }
  return false;
};

const mergePiece = (board, piece, position) => {
  const nextBoard = board.map((row) => [...row]);
  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;
      const boardX = position.x + x;
      const boardY = position.y + y;
      if (boardY >= 0) {
        nextBoard[boardY][boardX] = piece.color;
      }
    }
  }
  return nextBoard;
};

const clearLines = (board) => {
  const rows = [];
  let cleared = 0;
  board.forEach((row) => {
    if (row.every((cell) => cell)) {
      cleared += 1;
    } else {
      rows.push(row);
    }
  });

  while (rows.length < ROWS) {
    rows.unshift(Array(COLS).fill(null));
  }

  return { board: rows, cleared };
};

const TetrisGame = () => {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => createBoard());
  const [piece, setPiece] = useState(() => randomPiece());
  const [position, setPosition] = useState({ x: 3, y: -1 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = () => {
    setBoard(createBoard());
    setPiece(randomPiece());
    setPosition({ x: 3, y: -1 });
    setScore(0);
    setGameOver(false);
  };

  const spawnPiece = () => {
    const nextPiece = randomPiece();
    const nextPosition = { x: 3, y: -1 };
    if (hasCollision(board, nextPiece, nextPosition)) {
      setGameOver(true);
    } else {
      setPiece(nextPiece);
      setPosition(nextPosition);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'r') {
        resetGame();
        return;
      }

      if (gameOver) return;

      if (event.key === 'ArrowLeft') {
        const next = { ...position, x: position.x - 1 };
        if (!hasCollision(board, piece, next)) setPosition(next);
      }
      if (event.key === 'ArrowRight') {
        const next = { ...position, x: position.x + 1 };
        if (!hasCollision(board, piece, next)) setPosition(next);
      }
      if (event.key === 'ArrowDown') {
        const next = { ...position, y: position.y + 1 };
        if (!hasCollision(board, piece, next)) setPosition(next);
      }
      if (event.key === 'ArrowUp') {
        const rotated = rotate(piece.shape);
        const rotatedPiece = { ...piece, shape: rotated };
        if (!hasCollision(board, rotatedPiece, position)) {
          setPiece(rotatedPiece);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver, piece, position]);

  useEffect(() => {
    if (gameOver) return undefined;

    const interval = setInterval(() => {
      setPosition((current) => {
        const next = { ...current, y: current.y + 1 };
        if (!hasCollision(board, piece, next)) {
          return next;
        }

        const merged = mergePiece(board, piece, current);
        const cleared = clearLines(merged);
        if (cleared.cleared) {
          setScore((prev) => prev + cleared.cleared * 100);
        }
        setBoard(cleared.board);
        spawnPiece();
        return current;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [board, gameOver, piece]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    context.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i <= COLS; i += 1) {
      context.fillRect(i * CELL_SIZE, 0, 1, CANVAS_HEIGHT);
    }
    for (let i = 0; i <= ROWS; i += 1) {
      context.fillRect(0, i * CELL_SIZE, CANVAS_WIDTH, 1);
    }

    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (!cell) return;
        context.fillStyle = cell;
        context.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
    });

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) return;
        const drawX = (position.x + x) * CELL_SIZE;
        const drawY = (position.y + y) * CELL_SIZE;
        if (drawY < 0) return;
        context.fillStyle = piece.color;
        context.fillRect(drawX + 1, drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
    });
  }, [board, piece, position]);

  return (
    <div className="terminal-game">
      <div className="terminal-game__header">
        <span>Tetris</span>
        <span className="terminal-game__score">Score: {score}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="terminal-game__canvas"
      />
      <div className="terminal-game__hint">
        Arrows to move/rotate. Press R to restart. Esc to exit.
      </div>
      {gameOver && <div className="terminal-game__overlay">Game Over</div>}
    </div>
  );
};

export default TetrisGame;
