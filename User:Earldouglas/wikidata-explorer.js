'use strict';

(function ($, mw) {

  var bodyContent = document.getElementById('bodyContent');

  var addWikibaseItemClaim = function (rootId, claim, addLink) {
    var propertyId = claim.mainsnak.property;
    var targetId = 'Q' + claim.mainsnak.datavalue.value['numeric-id'];
    mw.wdGetEntities([propertyId, targetId]).apply(function (entities) {
      var toLabel = mw.wdEntityLabel(entities[targetId]);
      var linkLabel = mw.wdEntityLabel(entities[propertyId]);
      addLink(rootId, linkLabel, targetId, toLabel);
    });
  };

  var addStringClaim = function (rootId, claim, addLink) {
    var propertyId = claim.mainsnak.property;
    mw.wdGetEntity(propertyId).apply(function (property) {
      var linkLabel = mw.wdEntityLabel(property);
      addLink(rootId, linkLabel, claim.id, claim.mainsnak.datavalue.value);
    });
  };

  var addTimeClaim = function (rootId, claim, addLink) {
    var propertyId = claim.mainsnak.property;
    mw.wdGetEntity(propertyId).apply(function (property) {
      var linkLabel = mw.wdEntityLabel(property);
      addLink(rootId, linkLabel, claim.id, claim.mainsnak.datavalue.value.time);
    });
  };

  var addUrlClaim = function (rootId, claim, addLink) {
    var propertyId = claim.mainsnak.property;
    mw.wdGetEntity(propertyId).apply(function (property) {
      var linkLabel = mw.wdEntityLabel(property);
      addLink(rootId, linkLabel, claim.id, claim.mainsnak.datavalue.value);
    });
  };

  var addCommonsMediaClaim = function (rootId, claim, addLink) {
    var propertyId = claim.mainsnak.property;
    mw.wdGetEntity(propertyId).apply(function (property) {
      var linkLabel = mw.wdEntityLabel(property);
      var prefix = 'https://commons.wikimedia.org/wiki/File:';
      var toLabel = prefix + claim.mainsnak.datavalue.value;
      addLink(rootId, linkLabel, claim.id, toLabel);
    });
  };

  var addQuantityClaim = function (rootId, claim, addLink) {
    var propertyId = claim.mainsnak.property;
    mw.wdGetEntity(propertyId).apply(function (property) {
      var linkLabel = mw.wdEntityLabel(property);
      addLink(rootId, linkLabel, claim.id, claim.mainsnak.datavalue.value.amount);
    });
  };

  var addClaim = function (rootId, claim, addLink) {
    if (claim.mainsnak.datatype === 'wikibase-item') {
      addWikibaseItemClaim(rootId, claim, addLink);
    } else if (claim.mainsnak.datatype === 'string') {
      addStringClaim(rootId, claim, addLink);
    } else if (claim.mainsnak.datatype === 'time') {
      addTimeClaim(rootId, claim, addLink);
    } else if (claim.mainsnak.datatype === 'url') {
      addUrlClaim(rootId, claim, addLink);
    } else if (claim.mainsnak.datatype === 'commonsMedia') {
      addCommonsMediaClaim(rootId, claim, addLink);
    } else if (claim.mainsnak.datatype === 'quantity') {
      addQuantityClaim(rootId, claim, addLink);
    } else {
      console.log('dropping claim', claim.mainsnak.datatype);
    }
  };

  var resolveLink = function (propertyId, toId) {
    return mw.wdGetEntity(propertyId).flatMap(function (property) {
      return mw.wdGetEntity(toId).map(function (to) {
        return {
          property: property,
          to: to
        };
      });
    });
  };

  var explore = function (rootId, propertyId, claims, panel, addLink) {
    mw.wdGetEntity(propertyId).apply(function (property) {
      var button = document.createElement('button');
      button.innerHTML = mw.wdEntityLabel(property);
      button.onclick = function () {
        panel.clean();
        for (var claimIndex = 0; claimIndex < claims.length; claimIndex++) {
          var claim = claims[claimIndex];
          addClaim(rootId, claim, addLink);
        }
      };
      panel.insertBefore(button, panel.firstChild);
    });
  };

  var initExplorer = function () {

    bodyContent.removeChild(exploreBtn);

    var container = document.createElement('div');
    container.style.height = '36em';
    bodyContent.insertBefore(container, bodyContent.firstChild);

    var nodes = new mw.vis.DataSet();
    var edges = new mw.vis.DataSet();

    var network = new mw.vis.Network(container, { nodes: nodes, edges: edges }, {});

    var panel = document.createElement('div');
    panel.clean = function () {
      while (panel.firstChild) {
        panel.removeChild(panel.firstChild);
      }
    };
    bodyContent.insertBefore(panel, container.nextSibling);

    var showExplorer = function (id) {
      mw.wdGetEntity(id).apply(
        function (entity) {
          for (var claimId in entity.claims) {
            if (entity.claims.hasOwnProperty(claimId)) {
              var claims = entity.claims[claimId];
              explore(id, claimId, claims, panel, addLink);
            }
          }
        }
      );
    };

    network.on('select', function (properties) {
      panel.clean();
      if (properties.nodes.length === 1) {
        showExplorer(properties.nodes[0]);
      }
    });

    var rootId = mw.config.get('wgWikibaseItemId');

    var addLink = function(fromId, linkLabel, toId, toLabel) {
      if (!nodes.get(toId)) {
        nodes.add([ { id: toId, label: toLabel } ]);
      }
      edges.add([ { from: fromId, to: toId, label: linkLabel } ]);
    };


    mw.wdGetEntity(rootId).apply(
      function (entity) {
        nodes.add([ { id: rootId, label: mw.wdEntityLabel(entity) } ]);
      }
    );
  };

  var exploreBtn = document.createElement('button');
  exploreBtn.innerHTML = 'explore';
  exploreBtn.onclick = initExplorer;
  bodyContent.insertBefore(exploreBtn, bodyContent.firstChild);

})(jQuery, mediaWiki);

