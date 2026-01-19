"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Added Badge
import { Crown, Gamepad2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Lock, Trophy } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import Confetti from 'react-confetti';
import { cn } from '@/lib/utils';

// Game constants (Same as before)
const CANVAS_SIZE = [400, 400];
const SNAKE_START = [[8, 7], [8, 8]];
const FOOD_START = [8, 3];
const SCALE = 20;
const SPEED = 150;
const DIRECTIONS: { [key: string]: [number, number] } = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(SNAKE_START);
  const [food, setFood] = useState(FOOD_START);
  const [direction, setDirection] = useState<[number, number]>([0, -1]);
  const [speed, setSpeed] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const { user, setUser } = useUser() as any;
  const [highScores, setHighScores] = useState<number[]>(user?.gameHighScores || []);

  // QUEST LOGIC
  const currentBest = user?.highestGameScore || 0;
  const isQuestCompleted = currentBest >= 60;

  const startGame = () => {
    setSnake(SNAKE_START);
    setFood(FOOD_START);
    setDirection([0, -1]);
    setSpeed(SPEED);
    setGameOver(false);
    setScore(0);
    setShowConfetti(false);
  };

  const endGame = () => {
    setSpeed(null);
    setGameOver(true);

    // Update high scores
    const currentHighScores = user?.gameHighScores || [];
    const newHighScores = [...currentHighScores, score].sort((a: number, b: number) => b - a).slice(0, 5);
    setHighScores(newHighScores);

    // Update user's highest score if current score is higher
    const newHighestScore = Math.max(user?.highestGameScore || 0, score);

    if (setUser) {
      setUser({ highestGameScore: newHighestScore, gameHighScores: newHighScores });
    }

    if (score >= 60) {
      setShowConfetti(true);
    }
  };

  const createFood = () =>
    food.map((_, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));

  const handleDirectionChange = (newDirectionKey: string) => {
    if (DIRECTIONS[newDirectionKey]) {
      const [x, y] = direction;
      const [dx, dy] = DIRECTIONS[newDirectionKey];
      if ((x !== 0 && dx === -x) || (y !== 0 && dy === -y)) {
        return;
      }
      setDirection(DIRECTIONS[newDirectionKey]);
    }
  };

  const moveSnake = ({ keyCode }: { keyCode: string }) => {
    handleDirectionChange(keyCode);
  };

  const checkCollision = (piece: number[], snk: number[][] = snake) => {
    if (
      piece[0] * SCALE >= CANVAS_SIZE[0] ||
      piece[0] < 0 ||
      piece[1] * SCALE >= CANVAS_SIZE[1] ||
      piece[1] < 0
    ) {
      return true;
    }
    for (const segment of snk) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) {
        return true;
      }
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [snakeCopy[0][0] + direction[0], snakeCopy[0][1] + direction[1]];

    if (checkCollision(newSnakeHead)) {
      endGame();
      return;
    }

    snakeCopy.unshift(newSnakeHead);

    if (newSnakeHead[0] === food[0] && newSnakeHead[1] === food[1]) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 60) {
        endGame();
        return;
      }
      let newFood;
      do {
        newFood = createFood();
      } while (checkCollision(newFood, snakeCopy));
      setFood(newFood);
    } else {
      snakeCopy.pop();
    }

    setSnake(snakeCopy);
  };

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (context) {
      context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      context.fillStyle = 'white';
      context.fillRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
      context.fillStyle = 'black';
      snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
      context.fillStyle = 'hsl(var(--destructive))';
      context.fillRect(food[0], food[1], 1, 1);
    }
  }, [snake, food, gameOver]);

  useInterval(() => gameLoop(), speed);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      moveSnake({ keyCode: e.key });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (user) {
      setHighScores(user.gameHighScores || []);
    }
  }, [user]);

  return (
    <div className="space-y-6 pt-24 pb-24 px-4 min-h-screen flex flex-col items-center">
      <div className="w-full text-left">
        <h2 className="text-2xl font-bold tracking-tight">Snake Game</h2>
        <p className="text-zinc-400">Beat the high score!</p>
      </div>

      <Card className="w-full">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        <CardHeader>
          <div className="flex items-center gap-4">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Snake Game</CardTitle>
              <CardDescription>Beat the high score!</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-start gap-8">

          <div className="flex flex-col items-center gap-4 w-full">

            {/* --- NEW QUEST BANNER --- */}
            <div className={`w-full p-4 rounded-lg border flex items-center justify-between shadow-sm ${isQuestCompleted ? 'bg-green-100 dark:bg-green-900/20 border-green-200' : 'bg-muted/50 border-dashed'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isQuestCompleted ? 'bg-green-200 text-green-700' : 'bg-background shadow-sm text-muted-foreground'}`}>
                  {isQuestCompleted ? <Crown className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${isQuestCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
                    {isQuestCompleted ? "Quest Complete!" : "Quest: Snake Champion"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {isQuestCompleted ? "Badge unlocked on Profile" : "Score 60 to unlock Badge"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {isQuestCompleted ? (
                  <Badge className="bg-green-600 hover:bg-green-700">Unlocked</Badge>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-muted-foreground">{currentBest} / 60</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${Math.min((currentBest / 60) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* ------------------------- */}

            <div className="text-xl font-bold">Current Score: <span className="text-primary">{score}</span></div>

            <div className="border-4 border-border/50 rounded-md relative max-w-full shadow-inner bg-gray-50 dark:bg-black/20">
              <canvas
                ref={canvasRef}
                width={`${CANVAS_SIZE[0]}px`}
                height={`${CANVAS_SIZE[1]}px`}
                className="max-w-full h-auto"
              />
              {gameOver && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                  {score >= 60 ? (
                    <div className="text-center">
                      <Crown className="h-16 w-16 text-yellow-400 mx-auto animate-bounce" />
                      <div className="text-white font-bold text-3xl mt-4">Amazing!</div>
                      <p className="text-yellow-300 mt-2 font-medium">You unlocked the Champion Badge!</p>
                    </div>
                  ) : (
                    <div className="text-white font-bold text-2xl mb-2">Game Over</div>
                  )}
                  <Button onClick={startGame} className="mt-6 px-8" size="lg">
                    {score === 0 ? "Try Again" : "Play Again"}
                  </Button>
                </div>
              )}
            </div>

            {!gameOver && speed === null && (
              <Button onClick={startGame} size="lg" className="px-8 shadow-lg shadow-primary/20">
                Start Game
              </Button>
            )}

            {/* Mobile Controls */}
            <div className={cn("grid grid-cols-3 gap-2 mt-4 md:hidden", speed === null ? 'hidden' : '')}>
              <div></div>
              <Button variant="outline" size="icon" className="h-16 w-16 active:bg-primary/20" onClick={() => handleDirectionChange('ArrowUp')}>
                <ArrowUp className="h-8 w-8" />
              </Button>
              <div></div>

              <Button variant="outline" size="icon" className="h-16 w-16 active:bg-primary/20" onClick={() => handleDirectionChange('ArrowLeft')}>
                <ArrowLeft className="h-8 w-8" />
              </Button>
              <Button variant="outline" size="icon" className="h-16 w-16 active:bg-primary/20" onClick={() => handleDirectionChange('ArrowDown')}>
                <ArrowDown className="h-8 w-8" />
              </Button>
              <Button variant="outline" size="icon" className="h-16 w-16 active:bg-primary/20" onClick={() => handleDirectionChange('ArrowRight')}>
                <ArrowRight className="h-8 w-8" />
              </Button>
            </div>
          </div>

          <div className="w-full md:w-64">
            <h3 className="text-lg font-semibold mb-4 text-center border-b pb-2 flex items-center justify-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Leaderboard
            </h3>
            <ol className="space-y-2 list-decimal list-inside">
              {highScores.map((highScore, index) => (
                <li key={index} className="flex items-center justify-between text-sm p-3 rounded-md bg-muted/30 border">
                  <span className="flex items-center gap-2">
                    {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                    Rank {index + 1}
                  </span>
                  <span className="font-mono font-bold">{highScore}</span>
                </li>
              ))}
              {highScores.length === 0 && (
                <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-md">
                  No games played yet. <br /> Be the first champion!
                </div>
              )}
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}