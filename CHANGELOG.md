# Changelog

## 2.0.0

This update forces a major change in the API and internal structure.

### 📰 documentation

- add [ADR-001: Base architecture of http lib](docs/adrs/001-adr-architecture.md)

### 🧹 cleanup

- remove old functions like index.mock.ts, index.helper.ts

### ⚙️ chore

- reduce complexity of getResponse and getHttpItem
- rewriting spy and externalize to @robert.tools/testing
- externalize common utilities to @robert.tools/utils
- externalize curl functions to @robert.tools/curl
- 🙈 hide: internalize getHttpItemFromHeader

### ✨ improvements

- re-design typings
- make it possible to add e.g. -X GET to the options to get a better status value
- create testing Item for URLS (URL_ITEMS)
- stabilize http handling when split header and content
- provide option to pass data in a curl request
- HTTP properties are sorted ASC

### 🐛 bug fixes

- fix bugs with http status (also with forwarding)

### 🗃️ API changes

- hide: getHttpItemFromHeader (rename: getHttpItemFromHeader => getHttpFromHeader)
- change signatures of functions

## 1.0.1
