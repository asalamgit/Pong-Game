import { Server } from 'socket.io';
import { Ball } from '../interface/Ball.interface';
import { Paddle } from '../interface/Paddle.interface';
import { GameService } from '../services/game.service';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 6;
const PADDLE_HEIGHT = 50;

export class Game {
  interval: NodeJS.Timeout;
  score: [number, number];
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;

  constructor(
    private readonly gameService: GameService,
    private readonly server: Server,
    private room: string,
    private playerId1: number,
    private playerId2: number,
    private mode: string,
  ) {
    this.score = [0, 0];
    this.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: 7,
      dx: 1,
      dy: 1,
    };
    this.paddle1 = {
      x: 0,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 0,
    };
    this.paddle2 = {
      x: CANVAS_WIDTH - PADDLE_WIDTH,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 0,
    };
    this.startGame();
    this.interval = setInterval(this.ballMove.bind(this), 10);
  }

  async startGame() {
    const player1Profile = await this.gameService.getUserWithProfile(
      this.playerId1,
    );
    const player2Profile = await this.gameService.getUserWithProfile(
      this.playerId2,
    );

    this.server.to(this.room).emit('startGame', {
      playerLeftId: this.playerId1,
      room: this.room,
      player1Profile: player1Profile,
      player2Profile: player2Profile,
    });
    this.server.to(this.room).emit('paddleLeftMove', this.paddle1.y);
    this.server.to(this.room).emit('paddleRightMove', this.paddle2.y);
  }

  paddleMove(isPlayerLeft: boolean, speed: number) {
    if (isPlayerLeft) {
      if (
        (speed > 0 && this.paddle1.y + this.paddle1.height < CANVAS_HEIGHT) ||
        (speed < 0 && this.paddle1.y > 0)
      ) {
        this.paddle1.y += speed;
        this.server.to(this.room).emit('paddleLeftMove', this.paddle1.y);
      }
    } else {
      if (
        (speed > 0 && this.paddle2.y + this.paddle1.height < CANVAS_HEIGHT) ||
        (speed < 0 && this.paddle2.y > 0)
      ) {
        this.paddle2.y += speed;
        this.server.to(this.room).emit('paddleRightMove', this.paddle2.y);
      }
    }
  }

  async endGame() {
    const player1Profile = await this.gameService.getProfile(this.playerId1);
    const player2Profile = await this.gameService.getProfile(this.playerId2);

    if (this.score[0] === 3) {
      const updatePlayer1Points = player1Profile.points + 10;
      const updatePlayer2Points =
        player2Profile.points >= 10
          ? player2Profile.points - 10
          : player2Profile.points;
      await this.gameService.addVictory(this.playerId1, updatePlayer1Points);
      await this.gameService.addDefeat(this.playerId2, updatePlayer2Points);
    } else if (this.score[1] === 3) {
      const updatePlayer1Points =
        player1Profile.points >= 10
          ? player1Profile.points - 10
          : player1Profile.points;
      const updatePlayer2Points = player2Profile.points + 10;
      await this.gameService.addDefeat(this.playerId1, updatePlayer1Points);
      await this.gameService.addVictory(this.playerId2, updatePlayer2Points);
    }

    this.gameService.saveGame(player1Profile, player2Profile, this.score);
    this.gameService.deleteGame(this.room);
  }

  commitment(direction: number) {
    this.ball.x = CANVAS_WIDTH / 2;
    this.ball.y = CANVAS_HEIGHT / 2;
    this.ball.dx = direction;
    this.ball.dy = direction;
    this.paddle1.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    this.paddle2.y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;
    this.server.to(this.room).emit('paddleLeftMove', this.paddle1.y);
    this.server.to(this.room).emit('paddleRightMove', this.paddle2.y);
  }

  scorePoint(playerNumber: number): string {
    this.score[playerNumber] += 1;
    this.server.to(this.room).emit('score', this.score);
    if (this.score[playerNumber] >= 3) {
      this.stopAndSaveGame();
      return 'endGame';
    }
    return 'continueGame';
  }

  ballHitPaddle(paddleId: number) {
    if (this.mode === 'speedBall') this.ball.dx = -this.ball.dx * 2;
    else this.ball.dx = -this.ball.dx;
    if (this.mode === 'paddleReduce') {
      if (paddleId === 1) {
        if (this.paddle1.height > 10) {
          this.paddle1.y += 5;
          this.paddle1.height -= 10;
        }
      } else {
        if (this.paddle2.height > 10) {
          this.paddle2.y += 5;
          this.paddle2.height -= 10;
        }
      }
    }
  }

  ballMove() {
    if (this.ball.x + this.ball.dx < this.ball.radius + PADDLE_WIDTH) {
      if (
        this.ball.y + this.ball.dy > this.paddle1.y &&
        this.ball.y + this.ball.dy < this.paddle1.y + this.paddle1.height
      ) {
        this.ballHitPaddle(1);
      } else {
        if (this.scorePoint(1) === 'endGame') return;
        this.commitment(-1);
      }
    }
    if (
      this.ball.x + this.ball.dx >
      CANVAS_WIDTH - this.ball.radius - PADDLE_WIDTH
    ) {
      if (
        this.ball.y + this.ball.dy > this.paddle2.y &&
        this.ball.y + this.ball.dy < this.paddle2.y + this.paddle2.height
      ) {
        this.ballHitPaddle(2);
      } else {
        if (this.scorePoint(0) === 'endGame') return;
        this.commitment(1);
      }
    }
    if (
      this.ball.y + this.ball.dy > CANVAS_HEIGHT - this.ball.radius ||
      this.ball.y + this.ball.dy < this.ball.radius
    ) {
      this.ball.dy = -this.ball.dy;
    }
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    if (this.mode === 'paddleReduce') {
      this.server.to(this.room).emit('ballMove', {
        x: this.ball.x,
        y: this.ball.y,
        paddle1Y: this.paddle1.y,
        paddle2Y: this.paddle2.y,
        paddle1Height: this.paddle1.height,
        paddle2Height: this.paddle2.height,
      });
    } else {
      this.server.to(this.room).emit('ballMove', {
        x: this.ball.x,
        y: this.ball.y,
      });
    }
  }

  stopAndSaveGame() {
    clearInterval(this.interval);
    this.endGame();
    this.server.to(this.room).emit('endGame', this.score);
  }

  quit(userId: number) {
    if (userId === this.playerId1) {
      this.score[0] = 0;
      this.score[1] = 3;
    } else {
      this.score[0] = 3;
      this.score[1] = 0;
    }
    this.server.to(this.room).emit('score', this.score);
    this.stopAndSaveGame();
  }
}
