Great timing to lock this in. Below is a **cleanly updated `ROADMAP.md`** that:

* **Removes the inline code block** (per your request)
* **Updates Phase 5A to reflect what is now implemented**
* Preserves forward-looking items for the *rest* of Phase 5A / Phase 5B
* Does **not** prematurely mark Phase 5A “complete” (gives you room for Step 2)

I’ve kept changes **surgical**—no philosophy drift, no scope creep.

---

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
  * a **credible bridge to ETH DeFi state**
* Avoid scope creep through explicit non-goals

---

## Anchor Networks (MVP)

Classic OS launches with **two first-class anchor networks** only:

| Network                    | Consensus | Role                 | Purpose                                   |
| -------------------------- | --------- | -------------------- | ----------------------------------------- |
| **Ethereum (ETH)**         | PoS       | DeFi reference       | Liquidity, credibility, protocol maturity |
| **Ethereum Classic (ETC)** | PoW       | Execution & issuance | Token creation, experimentation           |

No other networks are included during MVP.

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
* ❌ Cross-chain bridges (full integrations)
* ❌ Governance interfaces
* ❌ Automated strategies / bots
* ❌ Yield aggregation
* ❌ Backend execution services
* ❌ Embedding third-party dapp UIs
* ❌ NFT marketplaces

NFTs are only supported where they represent **financial positions** (e.g. Uniswap V3 LP NFTs).

---

## Development Phases

### ✅ Phase 1 — Foundation (`v0.0.1`)

**Status: Complete**

* Vite + React + TypeScript scaffold
* Strict domain model (`Token`, `ProtocolPosition`, `TxPlan`)
* Protocol service abstraction
* Network-scoped protocol registry
* Path aliasing (`@/`)
* Mock protocol adapters
* Deterministic, testable architecture baseline

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
* Multicall-based hydration
* Metadata normalization
* Feature-flagged protocol adapters

---

### ✅ Phase 4 — Reserve-Level ETH Positions (`v0.0.4`)

**Status: Complete**

* **Aave V3 (Ethereum)**

  * Supplied assets
  * Borrowed assets
  * Health factor
  * Net value
* Proven adapter pattern on mainnet data
* Dashboard rendering from live state

---

## ▶️ Phase 5 — App Shell & ETH DeFi Coverage (`v0.0.5`)

### Phase 5A — Application Shell (In Progress)

**Objective:**
Establish Classic OS as an *operating system*, not a single-page dashboard.

**Implemented:**

* Global application shell

  * Persistent left sidebar navigation
  * Persistent top bar
* Router-backed page structure
* Global wallet and chain context moved into TopBar
* Capability-oriented sidebar navigation

  * Portfolio
  * Swap
  * Lend / Borrow
  * Liquidity
* External ecosystem links (no embedding)

  * Token Launch (external launchpad)
  * Fiat On / Off-Ramp (Brale)
* Structural UI boundaries (sidebar divider, footer spacer)

**Remaining in Phase 5A:**

* Network-aware enable / disable states
* Clear “coming soon” gating for unsupported actions

This phase defines **capabilities and structure**, not full implementations.

---

### Phase 5B — ETH DeFi Coverage

**Objective:**
Make the ETH side feel *credible, complete, and familiar*.

**Lending**

* Aave V2
* Compound V3

**DEX / Liquidity**

* Uniswap V2
* Uniswap V3

Positions render via **position-type UI modules**, not protocol-specific UIs.

---

## ▶️ Phase 6 — ETC Network Enablement (`v0.0.6`)

**Structural milestone**

* Add **Ethereum Classic** as first PoW anchor network
* Implement:

  * **WETC** token primitive
  * **ETCswap V2** adapter
* Validate:

  * network-specific protocol availability
  * graceful handling of unsupported actions

This phase proves PoW parity at the **architecture level**, not feature parity.

### ETC Stablecoin Primitive (USC)

Ethereum Classic’s canonical stablecoin is **Classic USD (USC)**.

* USC is treated as a **first-class token primitive**
* Balances, swaps, and liquidity positions are fully supported
* Mint and redeem flows are **externally managed** (Brale)
* Classic OS links to issuer-managed UX and does not embed it

---

## ▶️ Phase 7 — ETC DeFi Expansion (`v0.1.0` — Internal MVP)

**Differentiation milestone**

* **ETCswap V3** adapter
* ETC dashboard parity:

  * DEX positions
  * Token holdings
  * Liquidity visibility
* ETC-first UX assumptions

At this point:

* **ETH** = liquidity & reference layer
* **ETC** = execution & experimentation hub

This constitutes the **internal Classic OS MVP**.

---

## ▶️ Phase 8 — ETC Ecosystem Product Integration (`v0.1.x`)

Classic OS integrates **external ETC products** without embedding them.

### ETCswap Launchpad (External)

* Product lives at `launchpad.etcswap.org`
* Classic OS responsibilities:

  * Discover launchpad-origin tokens
  * Display balances and liquidity
  * Attribute origin clearly
  * Deep-link to product UI

Classic OS does **not** own:

* Token creation flows
* Deployment UX
* Liquidity bootstrapping logic

---

## ▶️ Phase 9 — Branding & Robust UI (`v0.1.x`)

**Required before external visibility**

* Visual identity (logo, color system, typography)
* Network-aware grouping
* Action-type grouping
* Robust formatting for small / zero balances
* Clear empty and unsupported states
* Light landing framing

This phase is about **trust signaling**, not cosmetic polish.

---

## ▶️ Phase 10 — Data Layer Hardening (`v0.2.x`)

* Query caching & staleness control
* Retry / backoff strategies
* RPC fallback support
* Code splitting and performance optimization

---

## Final Positioning

Classic OS does not attempt to treat all chains equally.

It intentionally positions:

* **Ethereum (ETH)** as the mature PoS DeFi reference layer
* **Ethereum Classic (ETC)** as the PoW execution and issuance frontier

Classic OS is the **meta dapp for Ethereum Classic**.