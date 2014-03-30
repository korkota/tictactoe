/**
 * Игровая доска.
 * @param {number} row Количество строк.
 * @param {number} col Количество столбцов.
 * @constructor
 */
game.Board = function(row, col) {
  this._row = row;
  this._col = col;

  this._board = new Array(row);

  for(var currentRow = 0; currentRow < row; currentRow++) {
    this._board[currentRow] = new Array(col);
  }
};

/**
 * Получить список свободных клеток игровой доски.
 * @returns {Array.<Object>}
 */
game.Board.prototype.getFreeCells = function() {
  var result = [];

  for(var i = 0; i < this._row; i++) {
    for(var j = 0; j < this._col; j++) {
      var isEmpty = !this._board[i][j];

      if (isEmpty) {
        result.push({row: i, col: j});
      }
    }
  }
  return result;
};

/**
 * Очистить игровую доску.
 * @private
 */
game.Board.prototype._clear = function() {
  this._board.forEach(function(row) {
    for(var i = 0; i < row.length; i++) {
      row[i] = null;
    }
  });
};

/**
 * Проверка, что указанная клетка лежить в границах игровой доски.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 * @returns {boolean} Клетка пренадлежит игровой доске.
 * @private
 */
game.Board.prototype._checkRange = function(row, col) {
  return ((row >= 0) && (row < this._row) && (col >= 0) && (col < this._col));
};

/**
 * Проверка, что клетка доступна для хода.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 * @returns {boolean} В эту клетку можно совершить ход.
 * @private
 */
game.Board.prototype._isAvailableCell = function(row, col) {
  return this._checkRange(row, col) && !this._board[row][col];
};

/**
 * Поставить на игровой клетку метку игрока.
 * @param {string} mark Метка игрока.
 * @param {number} row Строка.
 * @param {number} col Столбец.
 * @returns {boolean} Удалось ли выполнить действие.
 */
game.Board.prototype.markCell = function(mark, row, col) {
  if (this._isAvailableCell(row, col)) {
    this._board[row][col] = mark;
    return false;
  } else {
    return true;
  }
};

/**
 * Проверка, что с игрок с заданной меткой победил.
 * @param {string} mark Метка игрока.
 * @returns {boolean} Игрок победил.
 */
game.Board.prototype.checkWinner = function(mark) {
  var checkCell = function(cell) {
    return cell == mark;
  };

  /* Вообще проверку можно делать на основе совершенного игроком хода, т.е.
     смещаться от выбранной игроком клетки в разных направлениях и считать длину
     получившейся линии, но для случая 3х3 это делать, в общем-то, бессмысленно.
   */
  if (
    // Проверка по строкам
    checkCell(this._board[0][0]) && checkCell(this._board[0][1]) && checkCell(this._board[0][2]) ||
    checkCell(this._board[1][0]) && checkCell(this._board[1][1]) && checkCell(this._board[1][2]) ||
    checkCell(this._board[2][0]) && checkCell(this._board[2][1]) && checkCell(this._board[2][2]) ||

    // Проверка по столбцам
    checkCell(this._board[0][0]) && checkCell(this._board[1][0]) && checkCell(this._board[2][0]) ||
    checkCell(this._board[0][1]) && checkCell(this._board[1][1]) && checkCell(this._board[2][1]) ||
    checkCell(this._board[0][2]) && checkCell(this._board[1][2]) && checkCell(this._board[2][2]) ||

    // Проверка по диагоналям
    checkCell(this._board[0][0]) && checkCell(this._board[1][1]) && checkCell(this._board[2][2]) ||
    checkCell(this._board[0][2]) && checkCell(this._board[1][1]) && checkCell(this._board[2][0])
    ) {
    return true;
  } else {
    return false;
  }
};