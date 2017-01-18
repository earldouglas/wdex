var wdex;
(function (wdex) {
    var sparql = function (query) {
        return spex.ajax('/proxies/wdq/sparql?query=' +
            encodeURIComponent(query)).map(function (x) {
            var parsed = JSON.parse(x);
            return new spex.SparqlResults(new spex.SparqlResultsHead(parsed.head.vars), new spex.SparqlResultsResults(parsed.results.bindings));
        });
    };
    var Wdex = (function () {
        function Wdex() {
            this.search = function (query) {
                return spex.ajax('/proxies/wd/api.php' +
                    '?action=wbsearchentities' +
                    '&search=' + encodeURIComponent(query) +
                    '&format=json' +
                    '&language=en' +
                    '&uselang=en' +
                    '&type=item' +
                    '&continue=0').map(function (resp) {
                    var res = JSON.parse(resp);
                    var nodes = (res && res.search) ? res.search : [];
                    for (var i = 0; i < nodes.length; i++) {
                        nodes[i] =
                            new spex.Node(nodes[i].concepturi, nodes[i].label, nodes[i].description, null);
                    }
                    return new spex.SearchResults(query, nodes);
                });
            };
            this.getMetadata = function (uri) {
                return sparql([
                    'SELECT ?label ?image WHERE {',
                    '  <' + uri + '> <http://www.w3.org/2000/01/rdf-schema#label> ?label .',
                    '  OPTIONAL { <' + uri + '> <http://www.wikidata.org/prop/direct/P18> ?image . }',
                    '  FILTER ( LANG(?label) = "en" )',
                    '} LIMIT 1'].join('\n')).map(function (sparqlResults) {
                    return new spex.Metadata(sparqlResults.results.bindings[0].label.value, (sparqlResults.results.bindings[0].image || { value: null }).value);
                });
            };
            this.getIncomingLinks = function (uri) {
                return sparql([
                    'SELECT ?sl ?o ?ol ?p ?pl ?oi ?si WHERE {',
                    '  <' + uri + '> <http://www.w3.org/2000/01/rdf-schema#label> ?sl .',
                    '  ?ps <http://wikiba.se/ontology#directClaim> ?p .',
                    '  ?ps <http://www.w3.org/2000/01/rdf-schema#label> ?pl .',
                    '  ?o ?p <' + uri + '> .',
                    '  ?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .',
                    '  OPTIONAL { ?o <http://www.wikidata.org/prop/direct/P18> ?oi . }',
                    '  OPTIONAL { <' + uri + '> <http://www.wikidata.org/prop/direct/P18> ?si . }',
                    '  FILTER ( LANG(?sl) = "en" ) .',
                    '  FILTER ( LANG(?pl) = "en" ) .',
                    '  FILTER ( LANG(?ol) = "en" ) .',
                    '} LIMIT 100'].join('\n')).map(function (sparqlResults) {
                    var edges = [];
                    for (var i = 0; i < sparqlResults.results.bindings.length; i++) {
                        var binding = sparqlResults.results.bindings[i];
                        var si = binding['si'] ? binding['si']['value'] : null;
                        var oi = binding['oi'] ? binding['oi']['value'] : null;
                        edges.push(new spex.Edge(binding['p']['value'], binding['pl']['value'], new spex.Node(binding['o']['value'], binding['ol']['value'], '', oi), new spex.Node(uri, binding['sl']['value'], '', si)));
                    }
                    return edges;
                });
            };
            this.getOutgoingLinks = function (uri) {
                return sparql([
                    'SELECT ?sl ?o ?ol ?p ?pl ?oi ?si WHERE {',
                    '  <' + uri + '> <http://www.w3.org/2000/01/rdf-schema#label> ?sl .',
                    '  <' + uri + '> ?p ?o .',
                    '  ?s <http://wikiba.se/ontology#directClaim> ?p .',
                    '  ?s <http://www.w3.org/2000/01/rdf-schema#label> ?pl .',
                    '  ?o <http://www.w3.org/2000/01/rdf-schema#label> ?ol .',
                    '  OPTIONAL { ?o <http://www.wikidata.org/prop/direct/P18> ?oi . }',
                    '  OPTIONAL { <' + uri + '> <http://www.wikidata.org/prop/direct/P18> ?si . }',
                    '  FILTER ( LANG(?sl) = "en" ) .',
                    '  FILTER ( LANG(?pl) = "en" ) .',
                    '  FILTER ( LANG(?ol) = "en" ) .',
                    '} LIMIT 100'].join('\n')).map(function (sparqlResults) {
                    var edges = [];
                    for (var i = 0; i < sparqlResults.results.bindings.length; i++) {
                        var binding = sparqlResults.results.bindings[i];
                        var si = binding['si'] ? binding['si']['value'] : null;
                        var oi = binding['oi'] ? binding['oi']['value'] : null;
                        edges.push(new spex.Edge(binding['p']['value'], binding['pl']['value'], new spex.Node(uri, binding['sl']['value'], '', si), new spex.Node(binding['o']['value'], binding['ol']['value'], '', oi)));
                    }
                    return edges;
                });
            };
        }
        return Wdex;
    }());
    wdex.Wdex = Wdex;
    ;
})(wdex || (wdex = {}));
