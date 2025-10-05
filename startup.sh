#!/bin/bash
# ============================================================
# Beginner Investor Hub - Unified Startup Manager (No Docker)
# Version: 3.0
# Author: Kevin Ringler / ChatGPT Optimization Pass
# ------------------------------------------------------------
# Highlights:
# - Timestamped colored logs
# - Auto-kill mode (--yes to auto-confirm)
# - Cross-platform virtualenv support
# - Background PID tracking
# - Retry + exponential backoff on service health
# - Consistent structure for CI or manual use
# ============================================================

set -euo pipefail
IFS=$'\n\t'

# ---------- CONFIGURATION ----------
STARTUP_TIMEOUT=10
MAX_RETRIES=4
BACKOFF_BASE=2
LOG_DIR="logs"
PID_DIR="pids"

# ---------- COLORS ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

# ---------- LOGGING ----------
timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
log() { echo -e "${CYAN}[$(timestamp)] [INFO]${NC} $*"; }
ok() { echo -e "${GREEN}[$(timestamp)] [OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[$(timestamp)] [WARN]${NC} $*"; }
err() { echo -e "${RED}[$(timestamp)] [ERROR]${NC} $*"; }
debug() { [[ "$DEBUG" == true ]] && echo -e "${BLUE}[$(timestamp)] [DEBUG]${NC} $*"; }

# ---------- ARGUMENT PARSING ----------
DEBUG=false; SKIP_DEPS=false; CLEAN_START=false; AUTO_YES=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug) DEBUG=true ;;
        --skip-deps) SKIP_DEPS=true ;;
        --clean) CLEAN_START=true ;;
        --yes|-y) AUTO_YES=true ;;
        --help)
            cat <<EOF
Usage: ./startup.sh [options]

Options:
  --debug        Enable verbose debug output
  --skip-deps    Skip dependency installation
  --clean        Remove old logs and pids
  --yes, -y      Auto-confirm destructive actions (non-interactive)
  --help         Show this message
EOF
            exit 0 ;;
        *) err "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# ---------- INITIAL SETUP ----------
mkdir -p "$LOG_DIR" "$PID_DIR"
[[ "$CLEAN_START" == true ]] && { log "Cleaning logs and PIDs..."; rm -rf "$LOG_DIR"/* "$PID_DIR"/*; ok "Cleaned"; }

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════╗
║ 🚀 Beginner Investor Hub - Startup Manager v3.0      ║
╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ---------- SYSTEM CHECKS ----------
check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        err "Missing dependency: $1"
        return 1
    fi
}

log "Performing system checks..."
check_cmd node; NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
[[ $NODE_MAJOR -lt 20 ]] && { err "Node.js ≥20 required"; exit 1; }
ok "Node.js $NODE_VERSION"

check_cmd npm && ok "npm $(npm -v)"
check_cmd python3 || check_cmd python
PYTHON_CMD=$(command -v python3 || command -v python)
ok "Python version: $($PYTHON_CMD --version)"

check_cmd pip3 || check_cmd pip
PIP_CMD=$(command -v pip3 || command -v pip)
check_cmd redis-cli && redis-cli ping &>/dev/null && ok "Redis OK" || warn "Redis not responding"
check_cmd psql && ok "PostgreSQL client OK" || warn "PostgreSQL client missing"

# ---------- ENVIRONMENT ----------
log "Preparing Python environment..."
if [[ ! -d ".venv" || "$CLEAN_START" == true ]]; then
    $PYTHON_CMD -m venv .venv
    ok "Global Python virtualenv created"
fi
source "$(find .venv -type f -name activate | head -1)" || { err "Failed to activate venv"; exit 1; }

if [[ "$SKIP_DEPS" == false && -f "shared/requirements.txt" ]]; then
    log "Installing shared dependencies..."
    $PIP_CMD install -r shared/requirements.txt --quiet
    ok "Python deps installed"
fi

# ---------- HELPER FUNCTIONS ----------
check_port() { lsof -Pi :$1 -sTCP:LISTEN -t &>/dev/null; }
kill_port() {
    local port=$1; local pid
    pid=$(lsof -ti:$port)
    [[ -n "$pid" ]] && { warn "Killing PID $pid on port $port"; kill -9 "$pid" 2>/dev/null || true; }
}

confirm_kill() {
    local port=$1
    if check_port "$port"; then
        warn "Port $port already in use."
        if [[ "$AUTO_YES" == true ]]; then
            kill_port "$port"
        else
            read -rp "Kill process on $port? (y/N): " choice
            [[ "$choice" =~ ^[Yy]$ ]] && kill_port "$port" || { err "Aborting $2 start."; return 1; }
        fi
    fi
}

check_service() {
    local url=$1; local name=$2; local retries=0; local delay=1
    while (( retries < MAX_RETRIES )); do
        if curl -sf "$url" >/dev/null; then ok "$name is responding"; return 0; fi
        (( retries++ ))
        warn "$name not ready (attempt $retries/$MAX_RETRIES)"
        sleep $(( delay *= BACKOFF_BASE ))
    done
    err "$name failed health checks"
    return 1
}

# ---------- SERVICE STARTERS ----------
start_node_service() {
    local name=$1 port=$2 dir=$3 cmd=${4:-"npm start"}
    log "Starting Node.js service: $name (port $port)"
    confirm_kill "$port" "$name" || return 1

    pushd "services/$dir" >/dev/null
    [[ -f package.json ]] || { err "package.json missing in $dir"; popd; return 1; }

    [[ "$SKIP_DEPS" == false ]] && npm install --silent
    local logf="../../$LOG_DIR/$name.log" pidf="../../$PID_DIR/$name.pid"
    $cmd >"$logf" 2>&1 & echo $! >"$pidf"
    popd >/dev/null

    sleep "$STARTUP_TIMEOUT"
    ps -p "$(cat $pidf)" &>/dev/null && check_service "http://localhost:$port/health" "$name" || err "$name failed to launch"
}

start_python_service() {
    local name=$1 port=$2 dir=$3 script=${4:-"src/main.py"}
    log "Starting Python service: $name (port $port)"
    confirm_kill "$port" "$name" || return 1

    pushd "$dir" >/dev/null
    [[ ! -d .venv ]] && $PYTHON_CMD -m venv .venv
    source "$(find .venv -type f -name activate | head -1)"
    [[ "$SKIP_DEPS" == false && -f requirements.txt ]] && $PIP_CMD install -r requirements.txt --quiet

    local logf="../../$LOG_DIR/$name.log" pidf="../../$PID_DIR/$name.pid"
    $PYTHON_CMD "$script" >"$logf" 2>&1 & echo $! >"$pidf"
    popd >/dev/null

    sleep "$STARTUP_TIMEOUT"
    ps -p "$(cat $pidf)" &>/dev/null && check_service "http://localhost:$port/health" "$name" || err "$name failed to start"
}

# ---------- START SERVICES ----------
log "Launching all services..."
start_node_service "backend-api" 3000 "backend-api-service"
start_node_service "market-data" 3002 "marketdata-ingestion"
start_node_service "ai-engine" 3003 "ai-microservice-engine"
start_python_service "risk-engine" 3001 "services/python-risk-engine"
start_node_service "portfolio-simulation" 3004 "portfolio-simulation"
start_python_service "auth-service" 8000 "shared/auth" "start.py"

# ---------- STATUS REPORT ----------
declare -A services=(
    ["Backend API"]="http://localhost:3000/health"
    ["Market Data"]="http://localhost:3002/health"
    ["AI Engine"]="http://localhost:3003/health"
    ["Risk Engine"]="http://localhost:3001/health"
    ["Portfolio Simulation"]="http://localhost:3004/health"
    ["Auth Service"]="http://localhost:8000/health"
)

echo -e "\n${YELLOW}═════════ SERVICE STATUS ═════════${NC}"
all_ok=true
for svc in "${!services[@]}"; do
    url=${services[$svc]}
    if curl -sf "$url" >/dev/null 2>&1; then echo -e "${GREEN}● $svc${NC}"; else echo -e "${RED}● $svc${NC}"; all_ok=false; fi
done

echo -e "\n${YELLOW}═════════ SERVICE URLS ═════════${NC}"
cat <<EOF
🌐 Backend API:          http://localhost:3000
📈 Market Data:          http://localhost:3002
🤖 AI Engine:            http://localhost:3003
⚠️  Risk Engine:          http://localhost:3001
💼 Portfolio Simulation: http://localhost:3004
🔐 Auth Service:         http://localhost:8000
EOF

echo -e "\n${YELLOW}═════════ LOG MANAGEMENT ═════════${NC}"
echo "tail -f $LOG_DIR/<service>.log"
echo "kill \$(cat $PID_DIR/<service>.pid)"

if [[ "$all_ok" == true ]]; then
    ok "All services running successfully!"
else
    warn "Some services failed — check logs."
fi
