/**
 * Обычный игрок.
 * @param {string} name Имя игрока.
 * @param {string} mark Метка игрока на доске.
 * @param {game.Model} model Модель.
 * @constructor
 */
game.Player = function(name, mark, model) {
  this.name = name;
  this.mark = mark;
  this.model = model;
  this.wins = 0;
};

/**
 * Совершить ход.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 */
game.Player.prototype.doTurn = function(row, col) {
  this.model.doTurn(this, row, col);
};