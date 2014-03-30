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