/**** wrapper (start) ****/
var isFirefox = typeof require !== 'undefined';

if (isFirefox) {
  app = require('./firefox/firefox');
}
/**** wrapper (end) ****/

// welcome
(function () {
  var version = app.storage.read("version");
  if (app.version() !== version) {
    app.timer.setTimeout(function () {
      app.tab.open("http://mybrowseraddon.com/seen-blocker.html?v=" + app.version() + (version && version !== "undefined" ? "&p=" + version + "&type=upgrade" : "&type=install"));
      app.storage.write("version", app.version());
    }, 3000);
  }
})();

var onCommand = (function () {
  var state = true;
  return function (e, s) {
    if (typeof s !== "undefined") {
      state = s;
    }
    else {
      state = !state;
    }
    var path = "./icons" + (state ? "" : "/disabled");
    app.button.icon =
    isFirefox ? {
      "16": path + "/16.png",
      "32": path + "/32.png",
      "64": path + "/64.png"
    } : {
      path: "../../data/" + path + "/32.png"
    };
    app.button.label = "Facebook™ Seen Blocker " + (state ? "(enabled)" : "(disabled)");
    app.storage.write("enabled", state);
  }
})();
app.button.onCommand(onCommand);
onCommand(null, app.storage.read("enabled") === "false" ? false : true);
