'use strict';

var app = {};

app.Promise = Promise;

app.activate = function () {
  var listener = function () {
    return {cancel: true};
  };
  function refresh () {
    if (app.storage.read('enabled') === 'true') {
      chrome.webRequest.onBeforeRequest.addListener(
        listener,
        { //Filter
          urls: [
            'https://www.facebook.com/ajax/mercury/change_read_status.php',
            'https://www.facebook.com/ajax/messaging/typ.php'
          ],
          types: ['xmlhttprequest']
        },
        ['blocking']);
    }
    else {
      chrome.webRequest.onBeforeRequest.removeListener(listener);
    }
  }

  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.enabled) {
      refresh();
    }
  });

  return refresh;
};

app.storage = (function () {
  var objs = {};
  chrome.storage.local.get(null, function (o) {
    objs = o;
    var script = document.createElement('script');
    document.body.appendChild(script);
    script.src = '../common.js';
    app.activate();
  });
  return {
    read: function (id) {
      return objs[id] + '';
    },
    write: function (id, data) {
      objs[id] = data;
      var tmp = {};
      tmp[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  };
})();

app.button = (function () {
  var onCommand;
  chrome.browserAction.onClicked.addListener(function () {
    if (onCommand) {
      onCommand();
    }
  });
  return {
    onCommand: function (c) {
      onCommand = c;
    },
    set icon (obj) {
      chrome.browserAction.setIcon(obj);
    },
    set label (label) {
      chrome.browserAction.setTitle({
        title: label
      });
    }
  };
})();

app.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      chrome.tabs.update(null, {url: url});
    }
    else {
      chrome.tabs.create({
        url: url,
        active: typeof inBackground === 'undefined' ? true : !inBackground
      });
    }
  },
  list: function (currentWindow) {
    var d = app.Promise.defer();
    chrome.tabs.query({
      currentWindow: currentWindow ? currentWindow : false
    },
    function (tabs) {
      d.resolve(tabs);
    });
    return d.promise;
  }
};

app.version = function () {
  return chrome[chrome.runtime && chrome.runtime.getManifest ? 'runtime' : 'extension'].getManifest().version;
};

app.timer = window;
