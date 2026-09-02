/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PRESENTATION COMP — BRANCH `comp` ONLY
 * ─────────────────────────────────────────────────────────────────────────────
 *  This file exists on the `comp` branch and nowhere else. It marks the build
 *  as a CLIENT PRESENTATION, not the real site.
 *
 *  A comp exists so a client can see the design carrying photography before
 *  the photography exists. The imagery in it is stand-in imagery: it is not
 *  Lana's work, it is not her clients, and a bride must never be able to
 *  mistake it for either.
 *
 *  Three things follow from that, and all three are enforced in code:
 *
 *    1. A banner is fixed to the top of every page saying what this is.
 *       It cannot be dismissed.
 *    2. Every route is noindex, and robots.txt disallows the whole site.
 *    3. NEVER alias this build to the production domain. There is no
 *       technical guard for that one — it is a rule, and it is why this file
 *       is on its own branch instead of behind an environment variable.
 *
 *  Merging `comp` into `main` or `redesign` is always a mistake.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const IS_COMP = true;

export const COMP_NOTICE =
  "Presentation comp — stand-in imagery, not Lana's work or her clients.";
