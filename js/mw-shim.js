function importScript(name) {

  var script = document.createElement('script');
  script.src = 'js/' + name;

  var head = document.getElementsByTagName('head')[0];
  head.appendChild(script);

}

var jQuery = $;
var mediaWiki = {
  config:  {
    get: function(k) {
      if (k === 'wgWikibaseItemId') {
        return 'Q39246';
      } else if (k === 'wgTitle') {
        return 'Richard Feynman';
      }
    }
  }
};

var mw = mediaWiki;

window.onload = importScript('User:Earldouglas/common.js');

