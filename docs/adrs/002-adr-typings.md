---
id: ADR-002
version: 2.0.0
title: Typings for http lib
status: accepted
date: 2026-09-18
authors:
  - Robert Willemelis
tags: [typings]
---
## Context
The http lib requires standardized typings to ensure type safety and consistency across the library. This ADR outlines the decisions regarding the typings for HTTP requests and responses.

## Decisions

### 1. HTTP Typings
Provide standardized types for HTTP requests and responses to ensure consistency and type safety across the library.

#### 📦 Decision:
* **HTTP** - Header only item
* **CurlItem** - Represents a single cURL command item for executing HTTP requests.
* **RAW** - Represents raw HTTP request or response data without any parsing or processing.