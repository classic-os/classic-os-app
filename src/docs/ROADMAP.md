<!-- src/docs/ROADMAP.md -->

# Classic OS — Development Roadmap

This document defines the authoritative development roadmap for **Classic OS**.

Classic OS is the primary hub for **Ethereum Classic (ETC)** activity and a conduit between the mature **PoS EVM ecosystem (Ethereum)** and the emerging **PoW EVM ecosystem (Ethereum Classic)**.

The roadmap is intentionally asymmetric:

* **Ethereum (ETH)** serves as the canonical PoS DeFi reference layer
* **Ethereum Classic (ETC)** serves as the canonical PoW execution and issuance layer

Classic OS is not a read-only dashboard.
It is a **meta dapp** designed to *use* protocols across these ecosystems.

---

## Macro Goals

* Establish a **network-scoped DeFi operating system**
* Treat protocols as **chain-specific**, not globally interchangeable
* Provide a **single, trusted interface** to:
  * observe positions
  * interact with protocols
  * navigate the ETC ecosystem
* Position Classic OS as:
  * the **home interface for ETC**
  * a **credible reference surface for ETH DeFi**
* Avoid scope creep through explicit non-goals

---

## Anchor Networks (MVP)

Classic OS launches with **two first-class anchor networks**, each with an associated testnet.

| Network                    | Consensus | Role                 | Purpose                                   |
| -------------------------- | --------- | -------------------- | ----------------------------------------- |
| **Ethereum (ETH)**         | PoS       | DeFi reference       | Liquidity, credibility, protocol maturity |
| **Sepolia (ETH Testnet)**  | PoS       | Validation layer     | Adapter and UX validation                 |
| **Ethereum Classic (ETC)** | PoW       | Execution & issuance | Token creation, experimentation           |
| **Mordor (ETC Testnet)**   | PoW       | Validation layer     | ETC protocol and UX validation            |

Testnets are used exclusively for **adapter validation and development**.
They are not treated as product networks.

---

## Architectural Principles

### Network-Scoped Protocols
Protocols are **network-scoped**.
Classic OS does not assume protocol parity across chains.

### UI Modularity
UI modules are **position-type and action-type driven**, not protocol-name driven.

* Lending positions share common UI modules across protocols
* DEX V2 LPs share common UI modules across networks
* DEX V3 NFT LPs share common UI modules across networks

### Native Flows, No Embedding
Classic OS implements **native interaction flows** for supported actions and does **not embed third-party dapp UIs**.

External products are **linked and surfaced**, not embedded.

---

## Explicit MVP Non-Goals

The following are intentionally **out of scope** for the MVP:

* ❌ Oracles (e.g. Chainlink)
* ❌ Cross-chain bridges
* ❌ Governance interfaces
* ❌ Automated strategies or bots
* ❌ Yield aggregation
* ❌ Backend execution services
* ❌ Embedding third-party dapp UIs
* ❌ NFT marketplaces

NFTs are supported **only** where they represent **financial positions**
(e.g. Uniswap V3 LP NFTs).

---

## Development Phases

---

### ✅ Phase 1 — Foundation (`v0.0.1`)
**Status: Complete**

* App scaffold (Vite, React, TypeScript)
* Strict domain model (`Token`, `ProtocolPosition`, `TxPlan`)
* Protocol service abstraction
* Network-scoped protocol registry
* Mock adapters and feature flags
* Deterministic, testable baseline

---

### ✅ Phase 2 — Wallet & Chain Awareness (`v0.0.2`)
**Status: Complete**

* Wallet connection
* Chain detection
* Selected chain state
* Testnet visibility gating

---

### ✅ Phase 3 — First Live Protocol Read (`v0.0.3`)
**Status: Complete**

* Live on-chain reads
* Multicall hydration
* Metadata normalization
* Feature-flagged adapters

---

### ✅ Phase 4 — Reserve-Level ETH Positions (`v0.0.4`)
**Status: Complete**

* Aave V3 (Ethereum)
* Supplied / borrowed assets
* Health factor and net value
* Proven mainnet adapter pattern

---

### ✅ Phase 5 — ETH DeFi Coverage & App Framework (`v0.0.5`)
**Status: Complete**

Phase 5 establishes Classic OS as a **credible DeFi operating system**, not a prototype.

* Persistent sidebar and top bar
* Router-backed page structure
* Capability-oriented navigation
* External ecosystem links (no embedding)
* **Aave V3, Compound V3**
* **Uniswap V2, Uniswap V3 (NFT LPs with real math)**
* Sepolia used for adapter and UX validation

At the end of Phase 5:
* ETH side is **functionally complete**
* Adapter architecture is **proven**
* UI structure is **stable but intentionally unbranded**

---

## ▶️ Phase 6 — Product Surface & Brand Foundation (`v0.0.6`)

This phase transitions Classic OS from an internal application into a **public-facing product**.

### Objectives

* Establish trust, clarity, and professionalism
* Separate **product surface** from **application runtime**
* Lay the groundwork for external users and contributors

### Deliverables

**New repositories (Classic OS GitHub org):**

* `classic-os-site`
  * Public landing page
  * Product positioning (ETH ↔ ETC)
  * Feature overview
  * Deep links into the app

* `classic-os-docs`
  * Architecture overview
  * Network and protocol philosophy
  * User-facing explanations
  * Roadmap and changelog

* `classic-os-assets`
  * Logos
  * Color system
  * Typography
  * OG / social images

### Constraints

* No wallet connection on the landing site
* No app logic duplication
* No premature marketing claims

This phase is about **credibility and framing**, not growth.

---

## ▶️ Phase 7 — ETC Network Enablement (`v0.0.7`)

Ethereum Classic is introduced as a first-class PoW anchor network.

* Add **Mordor (ETC testnet)** support
* Validate PoW-specific UX assumptions
* Add **Ethereum Classic (ETC mainnet)** support
* Implement:
  * **WETC** token primitive
  * **ETCswap V2** adapter
* Gracefully handle unsupported actions

This phase proves PoW parity at the **architecture level**, not feature parity.

---

## ▶️ Phase 8 — ETC DeFi Expansion (`v0.1.0` — Internal MVP)

* ETCswap V3 adapter
* ETC dashboard parity:
  * Token holdings
  * DEX positions
  * Liquidity visibility
* ETC-first UX assumptions

At this point:
* **ETH** = reference & liquidity layer
* **ETC** = execution & experimentation hub

This constitutes the **internal Classic OS MVP**.

---

## ▶️ Phase 9 — ETC Ecosystem Product Integration (`v0.1.x`)

* External ETC product discovery
* Token attribution and origin tracking
* Deep links to product UIs
* No embedding or ownership of external flows

---

## ▶️ Phase 10 — UI Hardening & Brand Completion (`v0.1.x`)

* Final visual identity across app + site
* Design system consolidation
* Robust empty and unsupported states
* Network-aware grouping and clarity
* Trust signaling polish

---

## ▶️ Phase 11 — Data Layer Hardening (`v0.2.x`)

* Query caching and staleness control
* Retry and backoff strategies
* RPC fallback support
* Performance and code-splitting

---

## Final Positioning

Classic OS intentionally positions:

* **Ethereum (ETH)** as the mature PoS DeFi reference layer
* **Ethereum Classic (ETC)** as the PoW execution and issuance frontier

Classic OS is the **meta dapp for Ethereum Classic**.
