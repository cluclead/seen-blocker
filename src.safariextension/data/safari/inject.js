function inject () {
  const fsWqgBgfBvv = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if(sDvcGhtiU && typeof url === "string" && url.indexOf("change_read_status.php") !== -1) {
      arguments[1] = 'about:blank';
    }
    return fsWqgBgfBvv.apply(this, arguments);
  };
}

if (window === window.top) {
  var script = document.createElement("script");
  document.body.appendChild(script);
  script.src = "data:text/javascript, var sDvcGhtiU = true; (" + inject.toString() + ").bind(window)()";

  safari.self.addEventListener("message", function (e) {
    if (e.name === "enabled") {
      var script = document.createElement("script");
      document.body.appendChild(script);
      script.src = "data:text/javascript, sDvcGhtiU = " + e.message;
    }
  }, false);
  safari.self.tab.dispatchMessage("initiated");
}
