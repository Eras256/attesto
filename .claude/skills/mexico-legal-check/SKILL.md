---
name: mexico-legal-check
description: >
  Checks whether a crypto/software product needs Mexican
  financial-regulatory registration: IFPE under Ley Fintech/LRITF,
  LFPIORPI's "actividad vulnerable" (art. 17 fr. XVI),
  facilitacion/intermediacion (art. 24 Bis 2-5 of the Acuerdo 115/2026
  Reglas de Caracter General -- NOT the LFPIORPI law's own article
  numbering, see the law-vs-reglamento warning below), or intermediacion
  con valores under the Ley del Mercado de Valores. Use before scaling a
  product, before citing it as "software-only" traction, or before a
  grant/SCF/investor submission leans on that claim. Covers where to
  get the real statute text and how to extract it when the PDF resists
  WebFetch.
allowed-tools: [Read, Write, Edit, WebFetch, WebSearch, Bash]
---

# Mexico legal check -- regtech posture

Adapted 2026-09-13 from a version of this process previously used
elsewhere, which had already caught and corrected a real mistake (a
session once concluded "Art. 24 Bis 4 does not exist" by checking only
LFPIORPI's own law text, missing that it lives in the reglamento
instead). This project's own memory does not hold the detailed,
multi-session case history that earlier pass was based on -- that
history isn't duplicated here since it would go stale immediately.
What follows is the generic process plus the substantive legal facts,
corroborated independently by this session via
web search against multiple compliance-focused secondary sources (DOF
code 5795797, published 7-ago-2026) before being accepted -- **not yet
grepped against the primary DOF PDF by this session specifically.**
Treat the dates below as well-corroborated, not primary-source-verified,
until someone actually runs the extraction steps below.

## READ THIS FIRST -- the law is not the same document as its reglamento

**Mexican financial regulation here comes in two independent layers,
each with its own article numbering:**

1. **The law itself** (e.g. LFPIORPI, `diputados.gob.mx/LeyesBiblio/pdf/
   LFPIORPI.pdf`) -- has its own article numbers. LFPIORPI's own text has
   no "24 Bis" article of any kind (only 22 Bis, 33 Bis/Ter/Quater, 41
   Bis, 51 Bis/Ter, 54 Bis) -- true, and irrelevant to test #3 below.
2. **The reglamento/Reglas de Caracter General SHCP issues to implement
   the law**, amended periodically by a numbered **Acuerdo** (e.g.
   Acuerdo 115/2026, DOF, 7-ago-2026) -- has its **own, separate**
   article numbering layered on top. **Art. 24 Bis 4 lives here, not in
   the law.**

**If you search only the law's own PDF for an article number and don't
find it, that does not mean the article is fabricated -- it may simply
live in the reglamento instead.** Before concluding any citation
"doesn't exist," confirm which of the two document types it was
originally attributed to, and fetch *that* document specifically.

## The four tests, in order

Run these in this order -- each is independent, passing one does not
answer the next:

1. **IFPE (LRITF art. 22)** -- does the product open or hold a
   per-client electronic-payment-fund *account* (a balance you
   credit/debit)? If it only ever moves money in one-off direct
   transfers with no stored balance per client, this is a "no."
2. **LFPIORPI art. 17 fr. XVI ("actividad vulnerable")** -- is the
   product habitually and professionally commercializing or exchanging
   virtual assets as its own business (acting as the exchange), as
   opposed to selling an unrelated service that happens to be paid for
   in crypto? This fraction has been in force since ~10-sep-2019 (added
   by the decree published DOF 9-mar-2018, 18-month vacatio legis), and
   was reformed 16-jul-2025, effective 17-jul-2025.
3. **Art. 24 Bis 4 of the Acuerdo 115/2026 (facilitacion/intermediacion,
   does NOT require custody)** -- the load-bearing question. Its own
   text opens "*Para efectos de lo previsto en la fraccion XVI del
   articulo 17 de la Ley, se entendera que se realiza la facilitacion o
   intermediacion...*" -- it defines what "facilitar" and "transferir"
   mean for fraccion XVI, and sets aviso/reporting mechanics. Treat
   tests #2 and #3 as one combined inquiry: does the product's
   infrastructure *connect, reconcile, or match* a client's own
   buy/sell/exchange/custody operation with a counterparty, on the
   client's behalf? Being paid for your *own* work product (analytics,
   a computed result, a report, an attestation) is not the same as
   *executing* someone else's transaction for them. **Art. 24 Bis 2, 3
   (custodia), and 5 anchor to the same fraccion-XVI-specific language**
   (24 Bis 2 uses "Tratandose de la Actividad Vulnerable a que se
   refiere la fraccion XVI..."). Art. 24 Bis 6 anchors to fraccion XV
   instead (real-estate leasing, unrelated). Art. 24 Bis and 24 Bis 1
   are NOT part of this fraccion-XVI-specific unit -- they're general
   procedural provisions touching many fracciones at once.
   **Effective date of Art. 24 Bis 2-5: 30-nov-2026**, per the Acuerdo's
   Transitorio Primero (general entry into force), corroborated
   independently via web search against multiple compliance sources
   (kyc-systems.com, apconsultores.com.mx, cumplimientopld.com.mx,
   piranirisk.com, all agreeing on DOF codigo 5795797, 7-ago-2026
   publication, 30-nov-2026 general effective date, with later dates
   -- 1-mar-2027 risk-based methodology/manual, 1-jun-2027 automated
   mechanisms, 1-ene-2028 first audit period -- for other, unrelated
   chapters). No source found supports a separate 17-ene-2027 date for
   these specific articles. **One narrower exception reported in an
   earlier pass of this research, not yet independently corroborated by
   this session:**
   a Transitorio Decimo Segundo reportedly gives actors *already
   registered* under fraccion XVI a ~6-month grace period (to
   ~30-may-2027) to update their Art. 10 Bis registration info
   specifically -- described as not delaying fraccion XVI or Art. 24
   Bis 2-5 themselves. Verify this specific transitorio's text directly
   before relying on it; it was not part of this session's own
   corroboration pass.
4. **LMV art. 2, "Intermediacion con valores"** -- only relevant if the
   product touches securities/tokenized equities specifically. Ask: does
   it (a) match buyers to sellers, (b) *execute* a securities
   transaction on a third party's behalf, or (c) trade its own account?
   A product that only reports facts about securities exposure fails
   all three prongs.

## Other regimes to rule out

5. **ITF de fondeo colectivo / crowdfunding (LRITF arts. 15-21)** -- does
   the product pool capital from multiple funders into a project/loan,
   or match investors to a funding target? Separate CNBV-licensed
   figure from IFPE.
6. **Banxico Circular 4/2019 (activos virtuales)** -- only relevant if
   the product partners with, white-labels for, or is acquired by an
   entity Banxico already regulates.
7. **Beneficiario Controlador disclosure (CFF arts. 32-B Ter/Quater/
   Quinquies)** -- general corporate-transparency regime, gated by
   having a Mexican legal entity, not by activity type.
8. **Territorial/jurisdiction nexus** -- genuinely open question, not
   resolved here: does LFPIORPI/LRITF reach a product whose company
   sits outside Mexico but markets to or is used by people in Mexico?
   Needs actual counsel, not assumed either way.

## Software-only design checklist

Concrete architecture choices that keep a product outside each regime:

- **Outside IFPE:** never accrue a per-client balance the product
  itself credits/debits over time; settle atomically, directly to/from
  the client's own external account or on-chain address.
- **Outside actividad vulnerable (test #2):** don't be the counterparty
  that buys, sells, or exchanges virtual assets as your own business.
  Being paid *in* crypto for an unrelated service is not the same as
  commercializing virtual assets yourself.
- **Outside Art. 24 Bis 4 facilitacion (test #3, the easiest to trip by
  accident, does not require custody):** never be the thing that
  connects, reconciles, or matches two other parties' operation. A pure
  "compute and return a result" or "record/report a fact about
  something that already happened elsewhere" function -- an oracle, a
  data service, an attestation layer -- is the cleanest shape here. A
  pure-fiat product is NOT automatically exempt just because fraccion
  XVI excludes fiat-denominated value -- Art. 24 Bis 4 covers
  facilitating intermediacion of flows in moneda nacional too, so the
  real question is transaction *topology* (does anything connected
  anywhere in the chain convert to/from a virtual asset on a client's
  behalf), not which currency your own component happens to touch.
- **Outside LMV intermediacion (test #4):** never match buyers/sellers
  of securities, never execute on a third party's behalf, never trade a
  securities position for your own account.
- **Watch the language, not just the code.** A technically clean,
  non-custodial architecture can still read as regulated activity if the
  product's own docs/marketing use words like "wallet," "exchange,"
  "custody," "broker," "intermediary," "matching engine," "fondo,"
  "deposit," or "balance" loosely. Name the actual capability (compute,
  attest, route information, settle directly between two self-custodied
  parties), not a financial-services category word.

## Getting the real statute text

Never rely on a compliance blog or search-engine summary as the final
word for a real decision -- use it only to corroborate before doing the
real extraction:

- **Federal statutes** (LFPIORPI, LRITF, LMV):
  `diputados.gob.mx/LeyesBiblio/pdf/<ACRONYM>.pdf`.
- **DOF publications** (specific Acuerdos, reforms):
  `dof.gob.mx/nota_detalle.php?codigo=<CODE>&fecha=<DATE>` -- the real
  download path is `nota_to_pdf.php` -> a client-side JS redirect to
  `abrirPDF.php?archivo=...`, which automated fetch tools often miss.
  `WebFetch` on the HTML page itself commonly truncates mid-document on
  a long Acuerdo -- confirmed directly by this session 2026-09-13
  (truncated partway through Article 24, before reaching the
  Transitorios).

**Extraction, in order of preference:**

1. **`pdftotext` first.** Download the PDF, then:
   ```
   pdftotext <file>.pdf <file>.txt
   grep -n -i "<term>" <file>.txt
   ```
   `pdftotext` ships with Git for Windows at
   `Program Files\Git\mingw64\bin\pdftotext.exe` -- usually already on
   `PATH`.
2. **Real browser session with Ctrl+F**, if `pdftotext` isn't available
   or the PDF is itself an image scan.
3. **`dof.gob.mx/nota_detalle.php?...` as an HTML alternative -- but its
   markup wraps almost every word in its own `<span>`, so a plain
   grep/text-search on the raw HTML finds nothing even though the words
   are right there.** Strip tags and HTML-unescape first, then grep the
   cleaned text. The `www.` subdomain of this host fails TLS
   validation; use the bare `dof.gob.mx` host.
4. **Cross-verify with a second independent method** before treating a
   quote as settled, not just single-sourced.

## When you're done

Write the product's read to `legal/mexico.md` (or the workspace's
equivalent), mark which parts are primary-source confirmed vs.
secondary-corroborated vs. reasoned inference, explicitly. This is
regulatory research for planning, **not formal legal advice** -- say so
every time.
