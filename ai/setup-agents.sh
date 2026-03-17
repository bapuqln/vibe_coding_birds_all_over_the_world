#!/usr/bin/env bash
set -euo pipefail

# AI Agent Environment Setup for kids-bird-globe
# Validates prerequisites and initializes the ai/ workspace.

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${BOLD}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
fail()  { echo -e "${RED}[FAIL]${NC}  $1"; }

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  AI Agent Setup — kids-bird-globe${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0

# ─── 1. Check gk (gstack CLI) ───────────────────────────────────
info "Checking gstack (gk) CLI..."
if command -v gk &>/dev/null; then
  GK_VERSION=$(gk version 2>/dev/null || echo "unknown")
  ok "gk installed: ${GK_VERSION}"
else
  fail "gk not found"
  warn "Install with:"
  echo "  curl -fsSL http://get.gstack.io/please | sh"
  echo "  gk version"
  ERRORS=$((ERRORS + 1))
fi

# ─── 2. Check Node.js / npm ─────────────────────────────────────
info "Checking Node.js..."
if command -v node &>/dev/null; then
  ok "node $(node -v)"
else
  fail "node not found"
  ERRORS=$((ERRORS + 1))
fi

info "Checking npm..."
if command -v npm &>/dev/null; then
  ok "npm $(npm -v)"
else
  fail "npm not found"
  ERRORS=$((ERRORS + 1))
fi

# ─── 3. Check project dependencies ──────────────────────────────
info "Checking node_modules..."
if [ -d "node_modules" ]; then
  ok "node_modules exists"
else
  warn "node_modules missing — run: npm install"
  ERRORS=$((ERRORS + 1))
fi

# ─── 4. Check spec-kit structure ────────────────────────────────
info "Checking spec-kit structure..."
SPECKIT_OK=true
for f in specs/kids-bird-globe/spec.md specs/kids-bird-globe/plan.md specs/kids-bird-globe/tasks.md; do
  if [ -f "$f" ]; then
    ok "$f"
  else
    warn "$f not found"
    SPECKIT_OK=false
  fi
done

if [ "$SPECKIT_OK" = true ]; then
  ok "spec-kit structure complete"
fi

# ─── 5. Check ai/ config files ──────────────────────────────────
info "Checking ai/ configuration..."
for f in ai/gstack.yaml ai/INTEGRATION.md ai/README.md; do
  if [ -f "$f" ]; then
    ok "$f"
  else
    warn "$f missing"
  fi
done

# ─── 6. Check Cursor commands ───────────────────────────────────
info "Checking Cursor spec-kit commands..."
CMD_COUNT=$(ls .cursor/commands/speckit.*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$CMD_COUNT" -gt 0 ]; then
  ok "${CMD_COUNT} spec-kit commands found in .cursor/commands/"
else
  warn "No spec-kit commands found in .cursor/commands/"
fi

# ─── 7. Check git status ────────────────────────────────────────
info "Checking git..."
if git rev-parse --git-dir &>/dev/null; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
  ok "git repo on branch: ${BRANCH}"
else
  warn "Not a git repository"
fi

# ─── Summary ────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}  All checks passed. Ready to use spec-kit + gstack.${NC}"
else
  echo -e "${YELLOW}${BOLD}  ${ERRORS} issue(s) found. See warnings above.${NC}"
fi
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. In Cursor:  /speckit.spec kids-bird-globe"
echo "  2. In Cursor:  /speckit.plan kids-bird-globe"
echo "  3. Terminal:   gk /plan --context specs/kids-bird-globe/plan.md"
echo "  4. In Cursor:  /speckit.implement kids-bird-globe"
echo "  5. Terminal:   git add . && gk /review"
echo ""
