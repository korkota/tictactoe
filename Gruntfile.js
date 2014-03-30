module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'js/namespaces.js',
          'js/util/*.js',
          'js/game/IPlayer.js',
          'js/game/Player.js',
          'js/game/AIPlayer.js',
          'js/game/Board.js',
          'js/game/Model.js',
          'js/game/Storage.js',
          'js/ui/View.js',
          'js/init.js'
        ],
        dest: 'js/build.js'
      }
    },

//    cssmin: { //описываем работу плагина минификации и конкатенации css.
//      with_banner: {
//        options: {
//          banner: '/* My minified CSS */'  //комментарий который будет в output файле.
//        },
//
//        files: {
//          'css/style.min.css' : ['css/style.css']   // первая строка - output файл. массив из строк, какие файлы конкатенировать и минифицировать.
//        }
//      }
//    },

//    'closure-compiler': {
//      frontend: {
//        closurePath: 'tools',
//        js: 'js/build.js',
//        jsOutputFile: 'js/build.min.js',
//        maxBuffer: 500,
//        options: {
//          compilation_level: 'ADVANCED_OPTIMIZATIONS',
//          language_in: 'ECMASCRIPT5_STRICT'
//        }
//      }
//    },
//
//    gjslint: {
//      options: {
//        flags: [ ],
//        reporter: {
//          name: 'console'
//        }
//      },
//      all: {
//        src: 'js/build.js'
//      }
//    },

    watch: { //описываем работу плагина слежки за файлами.
      scripts: {
        files: ['js/**/*.js'],  //следить за всеми js файлами в папке src
        tasks: ['concat', /*'gjslint','closure-compiler'*/]  //при их изменении запускать следующие задачи
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
/*  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.loadNpmTasks('grunt-gjslint');*/

  grunt.registerTask('default', ['concat', /*'cssmin', 'gjslint', 'closure-compiler',*/ 'watch']);
  grunt.registerTask('test', ['']);
};