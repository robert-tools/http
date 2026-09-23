---
id: ADR-001
version: 2.0.0
title: Base architecture of http lib
status: accepted
date: 2026-09-18
authors:
  - Robert Willemelis
tags: [architecture]
---
## Context
The http lib is an easy-to-use library for handling HTTP requests and responses in a standardized way.

## References
- 👉 [ADR-002: Typings](002-adr-typings.md) - Standardized typings for HTTP.
- 👉 [ADR-003: HTTP Item](003-adr-http-item.md) - Standardized representation of HTTP items.

## Decisions

### 2. Usage of @robert.tools/cmd

#### 📋Reasoning: 
* **easy:** its easy to test and handle instead of async promises.
* **security:** security handling is centralized at @robert.tools/cmd

#### ⚠️ Risks
* **size:** Big responses (e.g. images or large files) may cause errors.

### 3. forwarding

#### 📋Reasoning: 
* **loop instead of -L: ** Easier to analyze and handle and stop a loop
* **lastLocation:** Keeps track of the last location in a series of HTTP redirects.

### 4. HTTP Item from raw header

#### 📋Reasoning: 
* **sortASC:** sort the properties in an ascending order for consistency. Lowercase and remove dashes to make a real comparison easier.

### 4. options
#### 📋Reasoning: 
* **ua (User-Agent):** Allows users to pass a custom User-Agent string (default: -H "User-Agent: nodejs").


## 🔮 Future Considerations

* [ ] **async handling:** In the future, we may want to support asynchronous handling for HTTP requests and responses to improve performance and scalability. (👉 [ADR-005: Async handling in http lib](005-adr-async.md))

