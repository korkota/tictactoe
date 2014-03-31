/**
 * Модель.
 * @constructor
 */

game.Model = function() {
  this._board = new game.Board(3, 3);
  this._countRounds = null;
  this.player = new game.Player('Player', 'X', this);
  this.aiPlayer = new game.AIPlayer('AIPlayer', 'O', this);
  this._players = [this.player, this.aiPlayer];
  this._currentPlayer = null;
  this.storage = new game.Storage();
};

/**
 * Выполнить ход.
 * @param {game.IPlayer} player Игрок.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 */
game.Model.prototype.doTurn = function(player, row, col) {
  if (this._currentPlayer !== player) throw Error('Not your turn!');

  var wrongPosition = this._board.markCell(player.mark, row, col);
  if (wrongPosition) throw Error('Wrong position!');

  var isWinner = this._board.checkWinner(player.mark);

  if (isWinner) {
    this._endGame(player);
    return;
  }

  if (this.getFreeCells().length === 0) {
    this._endGame();
    return;
  }

  var newIndex = (this._players.indexOf(this._currentPlayer) + 1) % this._players.length;
  this._currentPlayer = this._players[newIndex];
  this.publish(this._currentPlayer.name, {row: row, col: col});
};

/**
 * Начать игру.
 * @param {?number} countRounds_opt Количество раундов в серии.
 */
game.Model.prototype.startGame = function(countRounds_opt) {
  this._currentPlayer = this._players[0];
  this._countRounds = countRounds_opt || 1;

  this.publish(this._currentPlayer.name);
};

/**
 * Завершить игру.
 * @param {game.Player} roundWinner Победитель раунда.
 * @private
 */
game.Model.prototype._endGame = function(roundWinner) {
  if (roundWinner) {
    roundWinner.wins++;
  }

  this._board._clear();
  this.publish('endOfRound');

  this._countRounds--;
  if (this._countRounds) { // Если в серии ещё остались несыгранные раунды.
    this._players.reverse();
    this.startGame(this._countRounds);
  } else { // Иначе записываем статистику игры и определяем, есть ли победитель.
    var record = {
      players: this.player.name + ' vs. ' + this.aiPlayer.name,
      date: (new Date()).toLocaleDateString(),
      score: this.player.wins + ':' + this.aiPlayer.wins
    };
    this.storage.save(record);

    var winner = this._getGameWinner();
    if (winner) {
      this.publish('gameWinner', winner);
    }

    this.player.wins = 0;
    this.aiPlayer.wins = 0;

    this.publish('waitNewGame');
  }
};

/**
 * Определяем победителя серии.
 * @returns {?game.Player} Победитель серии.
 * @private
 */
game.Model.prototype._getGameWinner = function() {
  if (this.player.wins === this.aiPlayer.wins) {
    return null;
  } else {
    return (this.player.wins > this.aiPlayer.wins) ? this.player : this.aiPlayer;
  }
}

/**
 * Получить массив свободных ячеек на игровой доске.
 * @returns {Array.<Object>} Массив свободных ячеек.
 */
game.Model.prototype.getFreeCells = function() {
  return this._board.getFreeCells();
};

util.mixin(game.Model.prototype, util.Mediator);
