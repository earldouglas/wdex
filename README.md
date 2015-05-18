## About

This project consists of two components:

1. A sandbox to develop [MediaWiki user scripts](https://www.mediawiki.org/wiki/Manual:Interface/JavaScript) locally, without a MediaWiki instance
2. A sample project that injects a graphical explorer of [Wikidata](https://www.wikidata.org/) data into wiki pages

## Usage

Fire up a local HTTP server:

```bash
python -m SimpleHTTPServer 8080
```

Then point your browser to [http://localhost:8080/](http://localhost:8080/).

![Wikidata Explorer screenshot](https://raw.githubusercontent.com/earldouglas/wikidata-explorer/master/readme/screenshot.png)

This simulates a MediaWiki environment, looking at the [wiki page for Richard Feynman](https://en.wikipedia.org/wiki/Richard_Feynman), who has the Wikidata ID [*Q39246*](https://www.wikidata.org/wiki/Q39246).

