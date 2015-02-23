function inject () {
  const fsWqgBgfBvv = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if(typeof url === "string" && url.indexOf("change_read_status.php") !== -1) {
      arguments[1] = 'about:blank';
    }
    return fsWqgBgfBvv.apply(this, arguments);
  };
}

if (window === window.top) {
  var script = document.createElement("script");
  document.body.appendChild(script);
  script.src = "data:text/javascript,(" + inject.toString() + ").bind(window)()";
}
