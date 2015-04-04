'use strict';

// Load Firefox based resources
var self    = require('sdk/self'),
    sp      = require('sdk/simple-prefs'),
    buttons = require('sdk/ui/button/action'),
    prefs   = sp.prefs,
    tabs    = require('sdk/tabs'),
    timers  = require('sdk/timers'),
    unload  = require('sdk/system/unload'),
    {Cc, Ci, Cu, Cr}  = require('chrome');

Cu.import('resource://gre/modules/Promise.jsm');

//toolbar button
exports.button = (function () {
  var onClick;
  var button = buttons.ActionButton({
    id: self.name,
    label: 'Facebook™ Seen Blocker',
    icon: {
      '16': './icons/16.png',
      '32': './icons/32.png'
    },
    onClick: function(e) {
      if (onClick) {
        onClick(e);
      }
    }
  });
  return {
    onCommand: function (c) {
      onClick = c;
    },
    set icon (obj) {
      button.icon = obj;
    },
    set label (label) {
      button.label = label;
    }
  };
})();

exports.storage = {
  read: function (id) {
    return (prefs[id] || prefs[id] + '' === 'false' || !isNaN(prefs[id])) ? (prefs[id] + '') : null;
  },
  write: function (id, data) {
    data = data + '';
    if (data === 'true' || data === 'false') {
      prefs[id] = data === 'true' ? true : false;
    }
    else if (parseInt(data) + '' === data) {
      prefs[id] = parseInt(data);
    }
    else {
      prefs[id] = data + '';
    }
  }
};

exports.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      tabs.activeTab.url = url;
    }
    else {
      tabs.open({
        url: url,
        inBackground: typeof inBackground === 'undefined' ? false : inBackground
      });
    }
  },
  list: function () {
    var temp = [];
    for each (var tab in tabs) {
      temp.push(tab);
    }
    return Promise.resolve(temp);
  }
};

exports.version = function () {
  return self.version;
};

exports.timer = timers;

var httpRequestObserver = {
  isRegistered: false,
  observe: function(subject, topic, data) {
    if (topic === 'http-on-modify-request') {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      var url = httpChannel.URI.spec;
      if (
        url.indexOf('facebook.com/ajax/mercury/change_read_status.php') !== -1 ||
        url.indexOf('facebook.com/ajax/messaging/typ.php') !== -1
      ) {
        subject.cancel(Cr.NS_BINDING_ABORTED);
      }
    }
  },
  get observerService() {
    return Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
  },
  register: function() {
    this.isRegistered = true;
    this.observerService.addObserver(this, 'http-on-modify-request', false);
  },
  unregister: function() {
    if (this.isRegistered) {
      this.observerService.removeObserver(this, 'http-on-modify-request');
    }
    this.isRegistered = false;
  }
};

sp.on('enabled', function () {
  httpRequestObserver[prefs.enabled ? 'register' : 'unregister']();
});
if (prefs.enabled) {
  httpRequestObserver.register();
}
unload.when(function () {
  httpRequestObserver.unregister();
});
