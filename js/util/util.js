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
