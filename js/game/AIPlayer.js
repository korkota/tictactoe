/**
 * AI игрок.
 * @param {string} name Имя игрока.
 * @param {string} mark Метка игрока на доске.
 * @param {game.Model} model Модель.
 * @constructor
 * @extends {game.Player}
 */
game.AIPlayer = function(name, mark, model) {
  game.AIPlayer.superclass.constructor.apply(this, arguments);
  model.subscribe(this.name, this._chooseTurn, this);
};

util.extend(game.AIPlayer, game.Player);

/**
 * Выбрать ход.
 * @private
 */
game.AIPlayer.prototype._chooseTurn = function() {
  var cells = this.model.getFreeCells();
  var randomIndex = Math.floor(Math.random() * cells.length);
  var cell = cells[randomIndex];
  this.doTurn(cell.row, cell.col);
};

/**
 * Совершить ход.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 */
game.AIPlayer.prototype.doTurn = function(row, col) {
  game.AIPlayer.superclass.doTurn.apply(this, arguments);
};

