// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

import CodeMirror from 'codemirror';

"use strict";

CodeMirror.defineMode("mylang", function() {

  var TOKEN_NAMES = {
    '+': 'positive',
    '-': 'negative',
    '@': 'meta'
  };

  var stringEater = function(type) {
    var prev;
    prev = false;
    return function(c) {
      prev = c;
      if (c === type) {
        return prev === "\\";
      }
      return true;
    };
  };

  return {
    startState: function() {
      return {
        prev: false,
        func: false,
        op: false,
        string: false,
        escape: false
      };
    },
    token: function(stream, state) {
      var ch, funcName;
      if (stream.eatSpace()) {
        return null;
      }
      ch = stream.next();
      if (ch === '"' || ch === "'") {
        stream.eatWhile(stringEater(ch));
        stream.next();
        state.prev = true;
        return "string";
      }
      if (['=', '>', '<'].indexOf(ch) > -1) {
        return 'comment';
      }
      if (/[0-9]/g.test(ch)) {
        return 'number';
      }

      if (ch === '(' || ch === ')') {
        return 'bracket';
      }
      // var tw_pos = stream.string.search(/[\t ]+?$/);

      // if (!stream.sol() || tw_pos === 0) {
      //   stream.skipToEnd();
      //   return ("error " + (
      //     TOKEN_NAMES[stream.string.charAt(0)] || '')).replace(/ $/, '');
      // }

      // var token_name = TOKEN_NAMES[stream.peek()] || stream.skipToEnd();

      // if (tw_pos === -1) {
      //   stream.skipToEnd();
      // } else {
      //   stream.pos = tw_pos;
      // }

      // return token_name;

    }
  };
});

CodeMirror.defineMIME("text/x-mylang", "mylang");
