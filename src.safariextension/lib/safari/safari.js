var app = {}

app.Promise = Q.promise;
app.Promise.defer = Q.defer;

app.storage = {
  read: function (id) {
    return localStorage[id] || null;
  },
  write: function (id, data) {
    if (id === "enabled") {
      safari.application.browserWindows.forEach(function (browserWindow) {
        browserWindow.tabs.forEach(function (tab) {
          if (tab.page) tab.page.dispatchMessage(id, data);
        });
      });
    }
    localStorage[id] = data + "";
  }
}

app.button = (function () {
  var onCommand,
      toolbarItem = safari.extension.toolbarItems[0];
  safari.application.addEventListener("command", function (e) {
    if (e.command === "toolbarbutton" && onCommand) {
      onCommand();
    }
  }, false);

  return {
    onCommand: function (c) {
      onCommand = c;
    },
    set label (val) {
      toolbarItem.toolTip = val;
    },
    set icon (obj) {
      toolbarItem.image = safari.extension.baseURI + 'data/icons/safari/' + (obj.path.indexOf('disabled') === -1 ? 'on' : 'off') + '.png';
    }
  }
})();

app.tab = {
  open: function (url, inBackground, inCurrent) {
    if (inCurrent) {
      safari.application.activeBrowserWindow.activeTab.url = url;
    }
    else {
      safari.application.activeBrowserWindow.openTab(inBackground ? "background" : "foreground").url = url;
    }
  },
  openOptions: function () {

  },
  list: function () {
    var wins = safari.application.browserWindows;
    var tabs = wins.map(function (win) {
      return win.tabs;
    });
    tabs = tabs.reduce(function (p, c) {
      return p.concat(c);
    }, []);
    return new app.Promise(function (a) {a(tabs)});
  }
}

app.version = function () {
  return safari.extension.displayVersion;
}

app.timer = window;



safari.application.addEventListener("message", function (e) {
  if(e.name === "initiated") {
     e.target.page.dispatchMessage("enabled", true);
  }
}, false);
