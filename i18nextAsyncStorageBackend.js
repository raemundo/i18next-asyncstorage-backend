(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.i18nextAsyncStorageBackend = factory());
}(this, (function () { 'use strict';

var arr = [];
var each = arr.forEach;
var slice = arr.slice;

function defaults(obj) {
  each.call(slice.call(arguments, 1), function (source) {
    if (source) {
      for (var prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// get from whatever version of react native that is being used.
var AsyncStorage = require('@react-native-async-storage/async-storage') || {};

var storage = {
  setItem: function setItem(key, value) {
    if (AsyncStorage) {
      return AsyncStorage.setItem(key, value);
    }
  },
  getItem: function getItem(key, value) {
    if (AsyncStorage) {
      return AsyncStorage.getItem(key, value);
    }
    return undefined;
  }
};

function getDefaults() {
  return {
    prefix: 'i18next_res_',
    expirationTime: 7 * 24 * 60 * 60 * 1000,
    versions: {}
  };
}

var Cache = function () {
  function Cache(services) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Cache);

    this.init(services, options);

    this.type = 'backend';
  }

  _createClass(Cache, [{
    key: 'init',
    value: function init(services) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults());
    }
  }, {
    key: 'read',
    value: function read(language, namespace, callback) {
      var _this = this;

      var store = {};
      var nowMS = new Date().getTime();

      if (!AsyncStorage) {
        return callback(null, null);
      }

      storage.getItem('' + this.options.prefix + language + '-' + namespace).then(function (local) {
        if (local) {
          local = JSON.parse(local);
          if (
          // expiration field is mandatory, and should not be expired
          local.i18nStamp && local.i18nStamp + _this.options.expirationTime > nowMS &&

          // there should be no language version set, or if it is, it should match the one in translation
          _this.options.versions[language] === local.i18nVersion) {
            delete local.i18nVersion;
            delete local.i18nStamp;
            return callback(null, local);
          }
        }

        callback(null, null);
      }).catch(function (err) {
        console.warn(err);
        callback(null, null);
      });
    }
  }, {
    key: 'save',
    value: function save(language, namespace, data) {
      if (AsyncStorage) {
        data.i18nStamp = new Date().getTime();

        // language version (if set)
        if (this.options.versions[language]) {
          data.i18nVersion = this.options.versions[language];
        }

        // save
        storage.setItem('' + this.options.prefix + language + '-' + namespace, JSON.stringify(data));
      }
    }
  }]);

  return Cache;
}();

Cache.type = 'backend';

return Cache;

})));
