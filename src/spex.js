var spex;
(function (spex) {
    ;
    var Ajax = (function () {
        function Ajax(url, k) {
            this.url = url;
            this.k = k;
        }
        Ajax.prototype.xmlHttpRequest = function () {
            return new XMLHttpRequest();
        };
        ;
        Ajax.prototype.run = function () {
            var _this = this;
            var xhr = this.xmlHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    _this.k(xhr.responseText);
                }
            };
            xhr.open('GET', this.url, true);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send();
        };
        ;
        Ajax.prototype.map = function (g) {
            var _this = this;
            return new Ajax(this.url, function (resp) {
                return g(_this.k(resp));
            });
        };
        ;
        return Ajax;
    }());
    spex.Ajax = Ajax;
    ;
    spex.ajax = function (url) {
        return new Ajax(url, function (resp) { return resp; });
    };
    var SearchResults = (function () {
        function SearchResults(query, results) {
            this.query = query;
            this.results = results;
        }
        return SearchResults;
    }());
    spex.SearchResults = SearchResults;
    var Node = (function () {
        function Node(uri, label, description, image) {
            this.uri = uri;
            this.label = label;
            this.description = description;
            this.image = image;
        }
        return Node;
    }());
    spex.Node = Node;
    var SparqlResultsHead = (function () {
        function SparqlResultsHead(vars) {
            this.vars = vars;
        }
        return SparqlResultsHead;
    }());
    spex.SparqlResultsHead = SparqlResultsHead;
    var SparqlResultsResults = (function () {
        function SparqlResultsResults(bindings) {
            this.bindings = bindings;
        }
        return SparqlResultsResults;
    }());
    spex.SparqlResultsResults = SparqlResultsResults;
    var SparqlResults = (function () {
        function SparqlResults(head, results) {
            this.head = head;
            this.results = results;
        }
        return SparqlResults;
    }());
    spex.SparqlResults = SparqlResults;
    var Metadata = (function () {
        function Metadata(label, image) {
            this.label = label;
            this.image = image;
        }
        return Metadata;
    }());
    spex.Metadata = Metadata;
    var Edge = (function () {
        function Edge(uri, label, from, to) {
            this.uri = uri;
            this.label = label;
            this.from = from;
            this.to = to;
        }
        return Edge;
    }());
    spex.Edge = Edge;
})(spex || (spex = {}));
