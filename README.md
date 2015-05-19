## About

This project uses [MediaWiki Shim](https://github.com/earldouglas/mediawiki-shim) and [MediaWiki user scripts](https://www.mediawiki.org/wiki/Manual:Interface/JavaScript) to inject a graphical explorer of [Wikidata](https://www.wikidata.org/) data into wiki pages.

Check out a [working demo](http://earldouglas.github.io/wikidata-explorer/Richard_Feynman/) using data for Richard Feynman.

## Usage

Fire up a local HTTP server:

```bash
$ ./server.sh
```

Then point your browser to [http://localhost:8080/Richard_Feynman](http://localhost:8080/Richard_Feynman):

![Exploring Richard Feynman's linked data](https://raw.githubusercontent.com/earldouglas/wikidata-explorer/gh-pages/readme/screenshot.png)

This simulates looking at the [Wikipedia page for Richard Feynman](https://en.wikipedia.org/wiki/Richard_Feynman), who has the Wikidata ID [*Q39246*](https://www.wikidata.org/wiki/Q39246).

