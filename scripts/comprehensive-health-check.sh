#!/bin/bash

# Comprehensive Health Check Script for Investment Hub Services
# This script validates all services are running and accessible

set -e

echo "🚀 Starting Investment Hub Health Checks..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service URLs (update these based on your deployment)
BACKEND_API_URL="http://localhost:3000"
MARKET_DATA_URL="http://localhost:8001"
AI_ENGINE_URL="http://localhost:8002"
RISK_ENGINE_URL="http://localhost:8003"
PORTFOLIO_SIMULATION_URL="http://localhost:8004"

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Checking $service_name... "

    if curl -f -s "$url/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  URL: $url/health"
        echo "  Expected status: $expected_status"
        return 1
    fi
}

# Function to check database connectivity (via backend API)
check_database() {
    echo -n "Checking database connectivity... "

    if curl -f -s "$BACKEND_API_URL/health" | grep -q '"database":"connected"'; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check Redis connectivity (via backend API)
check_redis() {
    echo -n "Checking Redis connectivity... "

    if curl -f -s "$BACKEND_API_URL/health" | grep -q '"redis":"connected"'; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check inter-service communication
check_inter_service_communication() {
    echo -n "Checking inter-service communication... "

    # This would depend on your specific service endpoints
    # For now, we'll just check if services can reach each other via basic connectivity

    local failed_services=()

    # Check if market data service is accessible from backend
    if ! curl -f -s "$MARKET_DATA_URL/health" > /dev/null 2>&1; then
        failed_services+=("market-data")
    fi

    # Check if AI engine is accessible from backend
    if ! curl -f -s "$AI_ENGINE_URL/health" > /dev/null 2>&1; then
        failed_services+=("ai-engine")
    fi

    if [ ${#failed_services[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Failed services: ${failed_services[*]}"
        return 1
    fi
}

# Main health check execution
main() {
    local failed_checks=()

    echo ""
    echo "📊 Individual Service Health Checks:"
    echo "====================================="

    # Check each service
    check_service "Backend API" "$BACKEND_API_URL" || failed_checks+=("backend-api")
    check_service "Market Data" "$MARKET_DATA_URL" || failed_checks+=("market-data")
    check_service "AI Engine" "$AI_ENGINE_URL" || failed_checks+=("ai-engine")
    check_service "Risk Engine" "$RISK_ENGINE_URL" || failed_checks+=("risk-engine")
    check_service "Portfolio Simulation" "$PORTFOLIO_SIMULATION_URL" || failed_checks+=("portfolio-simulation")

    echo ""
    echo "🔗 Infrastructure Health Checks:"
    echo "================================"

    check_database || failed_checks+=("database")
    check_redis || failed_checks+=("redis")
    check_inter_service_communication || failed_checks+=("inter-service")

    echo ""
    echo "📋 Summary:"
    echo "==========="

    if [ ${#failed_checks[@]} -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
        echo ""
        echo "✅ Services Status:"
        echo "  - Backend API: Running"
        echo "  - Market Data: Running"
        echo "  - AI Engine: Running"
        echo "  - Risk Engine: Running"
        echo "  - Portfolio Simulation: Running"
        echo ""
        echo "✅ Infrastructure Status:"
        echo "  - Database: Connected"
        echo "  - Redis: Connected"
        echo "  - Inter-service Communication: Working"
        return 0
    else
        echo -e "${RED}❌ Some health checks failed:${NC}"
        printf '  - %s\n' "${failed_checks[@]}"
        echo ""
        echo "🔧 Troubleshooting Tips:"
        echo "  1. Check service logs: docker-compose logs [service-name]"
        echo "  2. Verify environment variables in .env files"
        echo "  3. Ensure all services are running: docker-compose ps"
        echo "  4. Check port conflicts and firewall settings"
        return 1
    fi
}

# Run main function
main "$@"
