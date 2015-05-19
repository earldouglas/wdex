## About

This project uses [MediaWiki Shim](https://github.com/earldouglas/mediawiki-shim) and [MediaWiki user scripts](https://www.mediawiki.org/wiki/Manual:Interface/JavaScript) to inject a graphical explorer of [Wikidata](https://www.wikidata.org/) data into wiki pages.

## Examples

* [Richard Feynman](http://earldouglas.github.io/wikidata-explorer/Richard_Feynman/)

## Usage

Fire up a local HTTP server:

```bash
./server.sh
```

Then point your browser to [http://localhost:8080/](http://localhost:8080/):

![Wikidata Explorer screenshot](https://raw.githubusercontent.com/earldouglas/wikidata-explorer/gh-pages/readme/screenshot.png)

This simulates looking at the [Wikipedia page for Richard Feynman](https://en.wikipedia.org/wiki/Richard_Feynman), who has the Wikidata ID [*Q39246*](https://www.wikidata.org/wiki/Q39246).

