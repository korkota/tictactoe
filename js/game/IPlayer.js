/**
 * Интерфейс игрока.
 * @interface
 */
game.IPlayer = function() {};

/**
 * Совершить ход.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 */
game.IPlayer.prototype.doTurn = function(row, col) {};