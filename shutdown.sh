#!/bin/bash
# Shutdown script for Beginner Investor Hub services
# Version: 1.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PID_DIR="pids"
LOG_DIR="logs"

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════╗
║   🛑 Beginner Investor Hub - Shutdown Manager       ║
╚══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if PID directory exists
if [ ! -d "$PID_DIR" ]; then
    log_warning "No PID directory found. Services may not be running."
    exit 0
fi

# Function to stop a service by PID file
stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            log_info "Stopping $service_name (PID: $pid)..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
            
            # Wait for process to stop
            local count=0
            while ps -p $pid > /dev/null 2>&1 && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            if ps -p $pid > /dev/null 2>&1; then
                log_error "Failed to stop $service_name"
                return 1
            else
                log_success "✓ $service_name stopped"
                rm "$pid_file"
                return 0
            fi
        else
            log_warning "$service_name PID file exists but process not running"
            rm "$pid_file"
        fi
    else
        log_warning "No PID file found for $service_name"
    fi
}

# Stop all services
echo -e "\n${YELLOW}Stopping all services...${NC}\n"

stop_service "backend-api"
stop_service "market-data"
stop_service "ai-engine"
stop_service "risk-engine"
stop_service "portfolio-simulation"
stop_service "auth-service"

# Clean up any remaining processes (fallback)
log_info "Checking for remaining processes..."
remaining=$(ps aux | grep -E "(node.*services|python.*services|python.*shared/auth)" | grep -v grep | wc -l)

if [ $remaining -gt 0 ]; then
    log_warning "Found $remaining remaining processes. Cleaning up..."
    pkill -f "node.*services" 2>/dev/null || true
    pkill -f "python.*services" 2>/dev/null || true
    pkill -f "python.*shared/auth" 2>/dev/null || true
    sleep 2
fi

# Final check
remaining=$(ps aux | grep -E "(node.*services|python.*services|python.*shared/auth)" | grep -v grep | wc -l)
if [ $remaining -eq 0 ]; then
    log_success "All services stopped successfully"
else
    log_warning "Some processes may still be running. Check with: ps aux | grep -E 'node|python'"
fi

echo -e "\n${GREEN}✅ Shutdown complete${NC}\n"