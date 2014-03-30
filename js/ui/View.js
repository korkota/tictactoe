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
