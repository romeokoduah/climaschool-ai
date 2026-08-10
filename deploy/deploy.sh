#!/usr/bin/env bash
#
# ClimaSchool AI — deploy the SPA and the API to the Contabo host.
#
#   ./deploy/deploy.sh
#
# Assumes an ssh alias `contabo` in ~/.ssh/config with key auth and passwordless
# sudo for the deploying user. Re-running is safe: every step is idempotent, and
# nothing is restarted until the new code is already in place.
#
# First-run prerequisites on the server (one-off, not automated here because they
# touch the shared nginx/systemd config that ~10 other production apps depend on):
#   sudo mkdir -p /var/www/climaschool/{web,api}
#   sudo chown -R www-data:www-data /var/www/climaschool
#   sudo cp deploy/climaschool-api.service /etc/systemd/system/
#   sudo cp deploy/nginx-climaschool.conf /etc/nginx/sites-available/climaschool
#   sudo ln -sfn /etc/nginx/sites-available/climaschool /etc/nginx/sites-enabled/climaschool
#   create /var/www/climaschool/api/.env from backend/.env.example (chmod 600)
#   sudo systemctl enable climaschool-api

set -euo pipefail

SSH_HOST="contabo"
REMOTE_WEB="/var/www/climaschool/web"
REMOTE_API="/var/www/climaschool/api"
SERVICE="climaschool-api"
HEALTH_URL="http://127.0.0.1:8100/health"

# Resolve the repo root from this script's location, so the script works from
# any working directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
fail() { printf '\n\033[1;31mFAILED: %s\033[0m\n' "$*" >&2; exit 1; }

for tool in npm ssh tar; do
    command -v "$tool" >/dev/null 2>&1 || fail "'$tool' is not on PATH"
done

# rsync is the nicer transport but is absent from a stock Git-Bash/Windows setup,
# so fall back to tar-over-ssh. Both give the same result: the remote directory
# ends up mirroring the local one, with removed files actually removed.
if command -v rsync >/dev/null 2>&1; then
    TRANSPORT="rsync"
else
    TRANSPORT="tar"
fi

# publish <local-dir> <remote-dir> [extra tar --exclude args...]
publish() {
    local src="$1" dest="$2"; shift 2
    if [ "$TRANSPORT" = "rsync" ]; then
        local excludes=()
        for pat in "$@"; do excludes+=(--exclude "$pat"); done
        rsync -az --delete -e ssh "${excludes[@]}" "${src}/" "${SSH_HOST}:${dest}/"
    else
        local excludes=()
        for pat in "$@"; do excludes+=(--exclude="$pat"); done
        # Clear the destination first so --delete semantics are preserved, but keep
        # anything the server owns and we deliberately never ship (notably .env).
        ssh "$SSH_HOST" "find '${dest}' -mindepth 1 -maxdepth 1 ! -name '.env' ! -name '.venv' -exec rm -rf {} +"
        tar -czf - -C "$src" "${excludes[@]}" . | ssh "$SSH_HOST" "tar -xzf - -C '${dest}'"
    fi
    info "published $(basename "$src") via ${TRANSPORT}"
}

step "Checking connectivity to ${SSH_HOST}"
ssh -o BatchMode=yes "$SSH_HOST" 'echo "    connected to $(hostname)"' \
    || fail "cannot reach ssh host '${SSH_HOST}' — check ~/.ssh/config"

# ── 1. build the SPA ─────────────────────────────────────────────────────────
# vite.config.js picks its base from SITE_BASE first. This host serves the app at
# the domain root, so the assets must be root-relative — without SITE_BASE the
# build would default to the GitHub Pages base (/climaschool-ai/) and every asset
# would 404 here.
step "Building the frontend (SITE_BASE=/)"
cd "$REPO_ROOT"
# Test that vite actually resolves rather than that node_modules merely exists: a
# `npm ci` interrupted on Windows (a dev server holding esbuild.exe open will do it)
# leaves the directory present but gutted. `npm install` repairs that in place,
# where `npm ci` would just fail the same way again.
if [ ! -f node_modules/vite/package.json ]; then
    info "dependencies missing or incomplete — running npm install"
    npm install
else
    info "dependencies present (vite $(node -p "require('./node_modules/vite/package.json').version"))"
fi
# npx rather than `npm run build`: on Windows npm hands the script to cmd.exe, which
# does not always resolve the node_modules/.bin shim from a bash invocation.
# VITE_API_BASE tells the SPA a backend exists on this origin. It is set only for
# this host: the Vercel and Pages builds have no API on their origin and are HTTPS,
# so they must not advertise live features they cannot reach.
#
# MSYS_NO_PATHCONV=1 is load-bearing on Windows. Git Bash rewrites any value that
# looks like a Unix path before handing it to node.exe, so a bare `/` silently
# becomes `C:/Program Files/Git/` and every asset URL ships pointing at nonsense.
MSYS_NO_PATHCONV=1 SITE_BASE=/ VITE_API_BASE=/api/v1 npx vite build

[ -f "${REPO_ROOT}/dist/index.html" ] || fail "build produced no dist/index.html"

# Guard against the mangling above ever shipping unnoticed: asset URLs must be
# root-relative, and must not have acquired a drive or install path.
if grep -qE '(src|href)="/(assets)/' "${REPO_ROOT}/dist/index.html"; then
    info "asset paths are root-relative"
else
    printf '\n    offending asset references:\n' >&2
    grep -oE '(src|href)="[^"]*assets[^"]*"' "${REPO_ROOT}/dist/index.html" | sed 's/^/      /' >&2
    fail "built asset paths are not root-relative — SITE_BASE was mangled before reaching vite"
fi
info "built $(find "${REPO_ROOT}/dist" -type f | wc -l) file(s) into dist/"

# ── 2. publish the SPA ───────────────────────────────────────────────────────
# --delete keeps old fingerprinted assets from accumulating forever.
step "Syncing dist/ -> ${SSH_HOST}:${REMOTE_WEB}/"
publish "${REPO_ROOT}/dist" "${REMOTE_WEB}"

# ── 3. publish the API ───────────────────────────────────────────────────────
# .env is excluded deliberately: the server's copy holds the real SECRET_KEY and
# database password, and must never be overwritten from a developer machine.
step "Syncing backend/ -> ${SSH_HOST}:${REMOTE_API}/"
publish "${REPO_ROOT}/backend" "${REMOTE_API}" \
    '.venv' '__pycache__' '*.pyc' '.env' '.pytest_cache'

# ── 4. dependencies ──────────────────────────────────────────────────────────
step "Installing Python dependencies on the server"
ssh "$SSH_HOST" bash -euo pipefail <<REMOTE
    cd "${REMOTE_API}"
    if [ ! -x ".venv/bin/python" ]; then
        echo "    creating virtualenv"
        python3 -m venv .venv
    else
        echo "    virtualenv already present"
    fi
    ./.venv/bin/python -m pip install --quiet --upgrade pip
    ./.venv/bin/python -m pip install --quiet -r requirements.txt
    echo "    dependencies installed"
    sudo chown -R www-data:www-data "${REMOTE_API}"
REMOTE

# ── 5. restart and verify ────────────────────────────────────────────────────
# The health check is the gate: a green systemd unit only means the process is
# alive, not that it can reach PostgreSQL. /health does a real SELECT 1 and
# returns 503 when it cannot, which `curl -f` turns into a non-zero exit.
step "Restarting ${SERVICE} and verifying health"
ssh "$SSH_HOST" bash -euo pipefail <<REMOTE
    sudo systemctl daemon-reload
    sudo systemctl restart "${SERVICE}"

    for attempt in 1 2 3 4 5 6 7 8 9 10; do
        if curl -fsS "${HEALTH_URL}" >/dev/null 2>&1; then
            echo "    healthy after \${attempt} attempt(s):"
            curl -fsS "${HEALTH_URL}"
            echo
            exit 0
        fi
        sleep 2
    done

    echo "    health check FAILED — last 40 journal lines:" >&2
    sudo journalctl -u "${SERVICE}" -n 40 --no-pager >&2
    exit 1
REMOTE

# ── 6. nginx ─────────────────────────────────────────────────────────────────
# Validate before reloading: this host fronts ~10 other production apps, and a
# reload against a broken config would take every one of them offline.
step "Validating and reloading nginx"
ssh "$SSH_HOST" 'sudo nginx -t && sudo systemctl reload nginx && echo "    nginx reloaded"'

step "Deploy complete"
info "SPA  : http://169.58.42.182:8084/"
info "API  : http://169.58.42.182:8084/api/v1"
info "Docs : http://169.58.42.182:8084/docs"
info "Reference data: ssh ${SSH_HOST} '${REMOTE_API}/.venv/bin/python ${REMOTE_API}/seed.py'"
