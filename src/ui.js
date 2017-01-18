'use strict';

var wdex = new wdex.Wdex();

var events = {};
function initEvents(doc) {

  // Dispatch an event bundled with extra data
  events.dispatch = function (name, data) {
    var e = new Event(name);
    e.data = data;
    doc.dispatchEvent(e);
  };

  // Create a lambda to dispatch an event bundled with extra data
  events.dispatchK = function (name, data) {
    return function () {
      var e = new Event(name);
      e.data = data;
      doc.dispatchEvent(e);
    };
  };

}

var wdexUi = {};
function initWde(graphElement) {

  var nodes = new vis.DataSet();
  var edges = new vis.DataSet();

  var options = {
    nodes: {
      shapeProperties: {
        useBorderWithImage: true
      }
    },
    edges: {
      smooth: false,
    },
    physics: {
      barnesHut: {
        gravitationalConstant: -7500,
        springLength: 200,
      },
      enabled: false,
    },
    layout: {
      hierarchical: {
        enabled: false,
        direction: 'UD',
        sortMethod: 'directed',
      },
    },
  };

  var network = new vis.Network(
    graphElement,
    { nodes: nodes, edges: edges },
    options
  );

  network.on('click', function (properties) {
    events.dispatch('nodes-selected', properties.nodes);
  });

  wdexUi.scale = function (uri, width, height) {
//    return [ '/api/thumbor/unsafe/'
//           , width, 'x', height
//           , '/smart/'
//           , uri.replace(/^https?:\/\//, '')
//           ].join('');
    return uri;
  };

  wdexUi.showPanel = function (uri, bindings) {

    wdex.getMetadata(uri).map(function (metadata) {
      metadata.uri = uri;
      wdex.getOutgoingLinks(uri).map(function (links) {
        metadata.links = {};
        for (var i = 0; i < links.length; i++) {
          metadata.links[links[i].label] = links[i].to.label;
        }
        events.dispatch('metadata', metadata);
      }).run();
    }).run();

    var histogram = {};
    var tally = function(bindings) {
      for (var i = 0; i < bindings.length; i++) {
        var binding = bindings[i];
        var linkLabel = binding.label;
        histogram[linkLabel] = histogram[linkLabel] || 0;
        histogram[linkLabel] = histogram[linkLabel] + 1;
      }
    };
    tally(bindings);

    var links = [];
    for (var x in histogram) {
      if (histogram.hasOwnProperty(x)) {
        (function (x) {
          links.push({
            label: x,
            count: histogram[x],
            show: function () {
              showBindings(bindings, x);
            }
          });
        })(x);
      }
    }
    links.sort(function (a, b) { return b.count - a.count; });

    events.dispatch('links', links);

  };

  var showBindings = function (bindings, linkType) {
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      var linkLabel = binding.label;
      if (linkLabel === linkType) {
        wdexUi.addNode(binding.to.uri, binding.to.label, binding.to.image);
        wdexUi.addNode(binding.from.uri, binding.from.label, binding.from.image);
        addLink(binding.from.uri, linkLabel, binding.to.uri);
      }
    }
    if (!options.physics.enabled) {
      network.stabilize(200);
    }
  };

  var addLink = function(fromUri, linkLabel, toUri) {
    var id = fromUri + '-' + linkLabel + '-' + toUri;
    if (!edges.get(id)) {
      edges.add([ {
        id: id,
        from: fromUri,
        to: toUri,
        label: linkLabel,
        arrows: {
          to: {
            scaleFactor: 0.5,
          }
        },
      } ]);
    }
  };

  wdexUi.addNode = function(uri, label, image) {
    if (!nodes.get(uri)) {
      var node = {
        id: uri,
        label: label,
        size: 20,
      };
      if (image) {
        node.shape = 'image';
        node.image = wdexUi.scale(image, 64, 64);
      } else {
        node.shape = 'dot';
      }
      nodes.add([ node ]);
    }
  };

  wdexUi.setPhysics = function (enabled) {
    options.physics.enabled = enabled;
    network.setOptions(options);
  };

  wdexUi.setHierarchical = function (enabled) {
    options.layout.hierarchical.enabled = enabled;
    network.setOptions(options);
    network.stabilize(180);
  };

  document.getElementById('graph').onkeyup =
    function (e) {
      if (e.code === 'Delete') {
        network.deleteSelected();
      }
      console.log(e);
    };
}

var wdexInit = function () {

  document.getElementById('query').focus();

  initWde(document.getElementById('graph'));
  initEvents(document);

  document.getElementById('auto-arrange').onchange =
    function (e) {
      wdexUi.setPhysics(e.target.checked);
    };

  document.getElementById('hierarchical').onchange =
    function (e) {
      wdexUi.setHierarchical(e.target.checked);
    };

  // Remove child nodes from element with given id
  var prune = function (id) {
    var elem = document.getElementById(id);
    while (elem.hasChildNodes()) {
      elem.removeChild(elem.childNodes[0]);
    }
  };

  // Create a DOM element with the given attributes, and some builder
  // methods for adding child elements
  var elem = function (type, attributes, children) {
    var element = document.createElement(type);
    for (var k in attributes) {
      if (attributes.hasOwnProperty(k)) {
        element[k] = attributes[k];
      }
    }
    if (children && children.length) {
      for (var i = 0; i < children.length; i++) {
        element.appendChild(children[i]);
      }
    }
    return element;
  };

  document.addEventListener('query-change',
    function (e) {
      wdex.search(e.query).map(function (x) {
        events.dispatch('search-results', {
          query: x.query, results: x.results
        })
      }).run();
    }
  );

  document.getElementById('query').onkeyup =
    function () {
      var e = new Event('query-change')
      e.query = document.getElementById('query').value;
      document.dispatchEvent(e);
    };

  document.addEventListener('search-results',
    function (e) {
      // Make sure these results aren't out of date wrt the query input
      if (e.data.query === document.getElementById('query').value) {

        var searchResultsElem = document.getElementById('search-results');

        // Clean up search results list
        prune('search-results');
        searchResultsElem.style.display = 'none';

        if (e.data.results.length > 0) {
          // Show search results list
          searchResultsElem.style.display = 'block';

          // Hide search results list if user clicks outside of it
          document.addEventListener('click', function (e) {
            if (!searchResultsElem.contains(e.target)) {
              searchResultsElem.style.display = 'none';
            }
          });

          for (var i = 0; i < e.data.results.length; i++) {
            var result = e.data.results[i];
            searchResultsElem.appendChild(
              elem('div', { className: 'search-result' }, [
                elem('span', {
                  className: 'search-result-link',
                  onclick: events.dispatchK('select-search-result', result.uri),
                  innerHTML: result.label,
                })
              ].concat(result.description ? [
                elem('div', { innerHTML: result.description }) ] : [])
              )
            )
          }
        }
      }
    }
  );

  document.addEventListener('select-search-result',
    function (e) {
      document.getElementById('query').value = '';
      events.dispatch('search-results', { query: '', results: [] });
      var uri = e.data;
      wdex.getMetadata(uri).map(function (metadata) {
        wdexUi.addNode(uri, metadata.label, metadata.image);
      }).run();
    }
  );

  document.addEventListener('nodes-selected',
    function (e) {
      prune('metadata-table');
      prune('links-list');
      if (e.data.length === 1) {
        document.getElementById('metadata').style.display = 'block';
        document.getElementById('metadata-loading').style.display = 'block';
        document.getElementById('links').style.display = 'block';
        document.getElementById('links-loading').style.display = 'block';
        var uri = e.data[0];
        wdex.getOutgoingLinks(uri).map(function (outgoing) {
          wdex.getIncomingLinks(uri).map(function (incoming) {
            wdexUi.showPanel(uri, outgoing.concat(incoming));
          }).run();
        }).run();
      } else {
        document.getElementById('metadata').style.display = 'none';
        document.getElementById('links').style.display = 'none';
      }
    }
  );

  document.addEventListener('metadata',
    function (e) {
      prune('metadata-table');
      document.getElementById('metadata-loading').style.display = 'none';

      var metadataTable = document.getElementById('metadata-table');
      metadataTable.appendChild(
        elem('tr', {}, [
          elem('th', { className: 'label', innerHTML: 'URI:' }),
          elem('td', {}, [
            elem('a', { href: e.data.uri, innerHTML: e.data.uri, target: '_blank' })
          ]),
        ])
      );
      metadataTable.appendChild(
        elem('tr', {}, [
          elem('th', { className: 'label', innerHTML: 'Label:' }),
          elem('td', { innerHTML: e.data.label }),
        ])
      );
      if (e.data.image) {
        metadataTable.appendChild(
          elem('tr', {}, [
            elem('th', { className: 'label', innerHTML: 'Image:' }),
            elem('td', { }, [
              elem('a', { href: e.data.image, target: '_blank' }, [
                elem('img', { className: 'thumbnail'
                            , src: wdexUi.scale(e.data.image, 480, 480)
                            //, src: e.data.image.replace(/^https?:/, '')
                            })
              ])
            ]),
          ])
        );
      }
      for (var k in e.data.links) {
        if (e.data.links.hasOwnProperty(k)) {
          metadataTable.appendChild(
            elem('tr', {}, [
              elem('th', { className: 'label', innerHTML: k + ':' }),
              elem('td', { innerHTML: e.data.links[k] }),
            ])
          );
        }
      }
    }
  );

  document.addEventListener('links',
    function (e) {
      prune('links-list');
      document.getElementById('links-loading').style.display = 'none';
      for (var i = 0; i < e.data.length; i++) {
        var link = e.data[i];

        var label = document.createElement('em');
        label.innerHTML = '(' + link.count + ') ' + link.label;

        var a = document.createElement('a');
        a.href = "#";
        a.onclick = link.show;
        a.appendChild(label);

        var aContainer = document.createElement('li');
        aContainer.appendChild(a);

        var linksList = document.getElementById('links-list');
        linksList.appendChild(aContainer);
      }
    }
  );

};
