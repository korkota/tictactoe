/**
 * Все, что связано с логикой игры.
 * @namespace
 */
var game = {};

/**
 * Пользовательский интерфейс.
 * @namespace
 */
var ui = {};

/**
 * Вспомогательные функции.
 * @namespace
 */
var util = {};
/**
 * Функция для добавления миксинов.
 * @param {Object} dst
 * @param {Object} src
 */
util.mixin = function(dst, src) {
  var tobj = {}
  for(var x in src){
    if((typeof tobj[x] == "undefined") || (tobj[x] != src[x])){
      dst[x] = src[x];
    }
  }
  if(document.all && !document.isOpera){
    var p = src.toString;
    if(typeof p == "function" && p != dst.toString && p != tobj.toString &&
      p != "\nfunction toString() {\n    [native code]\n}\n"){
      dst.toString = src.toString;
    }
  }
};

/**
 * Миксин паттерна Mediator.
 */
util.Mediator = {
  channels: {},

  subscribe: function( channel, fn, ctx ){
    var channels = this.channels;

    if ( !channels[ channel ] ){ channels[ channel ] = []; }

    channels[ channel ].push({ context: ctx || this, callback: fn });

    return this;
  },

  unsubscribe: function( channel, fn ){
    var channels = this.channels,
      sub;

    if ( !channels[ channel ] ){ return false; }

    for ( var i = 0, len = channels[ channel ].length; i < len; i++ ){
      sub = channels[ channel ][ i ];

      if ( sub.callback === fn ){
        channels[ channel ].splice(i, 1);

        if ( channels[ channel].length < 1 ){
          delete channels[ channel ];
        }
      }
    }

    return this;
  },

  publish: function( channel ){
    var channels = this.channels,
      args = Array.prototype.slice.call( arguments, 1 ),
      sub;

    if ( !channels[ channel ] ){ return false; }

    for ( var i = 0, len = channels[ channel ].length; i < len; i++ ){
      sub = channels[ channel ][ i ];
      sub.callback.apply( sub.context, args );
    }

    return this;
  }
};

/**
 * Функция наследования.
 * @param {function} Child Подкласс.
 * @param {function} Parent Суперкласс.
 */
util.extend = function(Child, Parent) {
  var F = function() { };
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  Child.prototype.constructor = Child;
  Child.superclass = Parent.prototype;
};

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

/**
 * Хранилище статистики.
 * @constructor
 */
game.Storage = function() {};

/**
 * Сохраняет запись в массив с результатами предыдущих игр.
 * @param {Object} record
 */
game.Storage.prototype.save = function(record) {
  var stats = this.loadAll.bind(this)();
  stats.push(record);
  localStorage.setItem('stats', JSON.stringify(stats))
};

/**
 * Загружает все результаты игр.
 * @returns {Array.<Object>}
 */
game.Storage.prototype.loadAll = function() {
  return JSON.parse(localStorage.getItem('stats')) || [];
};
/**
 * Представление.
 * @param {game.Model} model Модель.
 * @constructor
 */
ui.View = function(model) {
  this._model = model;

  this._model.subscribe(this._model.player.name, this.onOpponentTurn, this);
  this._model.subscribe('endOfRound', this.onEndOfRound, this);
  this._model.subscribe('gameWinner', this.onGameWinner, this);
  this._model.subscribe('waitNewGame', this.onWaitNewGame, this);

  document.querySelector('.start').onclick = this.onStart.bind(this);
  document.querySelector('.stats').onclick = this.getStats.bind(this);

};

// Впереди идёт армия коллбеков, на написание комментариев к которым время терять мне хочется.

ui.View.prototype._updateStatus = function() {
  document.querySelector('.status').innerHTML =
    this._model.player.name + ' vs. ' + this._model.aiPlayer.name + ' ' +
    this._model.player.wins + ':' + this._model.aiPlayer.wins
};

ui.View.prototype.onEndOfRound = function() {
  this.clearBoard();
  this._updateStatus();
};

ui.View.prototype.clearBoard = function() {
  var cells = document.getElementsByClassName('board')[0].querySelectorAll('td');

  for(var i = 0; i < cells.length; i++) {
    cells[i].innerHTML = '';
  }
};

ui.View.prototype.onOpponentTurn = function(cell) {
  if (!cell) return;

  var td = document.getElementsByClassName('board')[0]
    .querySelectorAll('tr')[cell.row]
    .querySelectorAll('td')[cell.col];
  td.innerHTML = this._model.aiPlayer.mark;
};

ui.View.prototype.onStart = function() {
  this._updateStatus();

  document.querySelector('.buttons').style.display = 'none';
  document.querySelector('.board').style.display = 'table';
  document.querySelector('.status').style.display = 'inline';

  var rows = document.getElementsByClassName('board')[0].querySelectorAll('tr');

  for(var i = 0; i < rows.length; i++) {
    var columns = rows[i].querySelectorAll('td');

    for(var j = 0; j < columns.length; j++) {
      columns[j].onclick = function(i, j) {
        return function(event) {
          var save = event.target.textContent;
          try {
            event.target.innerHTML = this._model.player.mark;
            this._model.player.doTurn(i, j);
          } catch (e) {
            event.target.innerHTML = save;
          }
        }.bind(this);
      }.bind(this)(i, j);
    }
  }

  var rounds = document.querySelector('.rounds').value;
  this._model.startGame(rounds);
};

ui.View.prototype.getStats = function() {
  var stats = this._model.storage.loadAll();
  var result = stats.reduceRight(function(value, currentRecord, index) {
    return value += (index + 1) + '. ' + currentRecord.players + ' ' +  currentRecord.score +
      ' ' + currentRecord.date + ' ' + '\n';
  }, 'Stats:\n');
  alert(result);
};

ui.View.prototype.onGameWinner = function(winner) {
  if (winner === this._model.player) {
    alert('You won! :)');
  } else {
    alert('You lose! D:')
  }
};

ui.View.prototype.onWaitNewGame = function() {
  this.clearBoard();
  document.querySelector('.buttons').style.display = 'block';
  document.querySelector('.board').style.display = 'none';
  document.querySelector('.status').style.display = 'none';
};

/**
 * Инициализация приложения.
 */
window.onload = function() {
  var model = new game.Model();
  var view = new ui.View(model);
};
