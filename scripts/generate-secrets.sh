#!/bin/bash

# ============================================================
# Beginner Investor Hub - Secret Generation Script
# ============================================================
# This script generates secure secrets for deployment
#
# Usage:
#   ./scripts/generate-secrets.sh [options]
#
# Options:
#   --env-file FILE      Specify environment file (default: .env)
#   --overwrite          Overwrite existing secrets
#   --validate-only      Only validate existing secrets
#   --format FORMAT      Output format: env|json|table (default: env)
#   --help              Show this help message
# ============================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENV_FILE=".env"
OVERWRITE=false
VALIDATE_ONLY=false
FORMAT="env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Secret requirements
declare -A SECRET_REQUIREMENTS=(
  ["JWT_SECRET"]="64"
  ["COOKIE_SECRET"]="32"
  ["SERVICE_AUTH_SECRET"]="128"
  ["DATABASE_ENCRYPTION_KEY"]="32"
)

declare -A API_KEY_PREFIXES=(
  ["MARKET_DATA_API_KEY"]="md_"
  ["FINNHUB_API_KEY"]="fh_"
  ["ALPHA_VANTAGE_API_KEY"]="av_"
)

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*"
}

# Show help
show_help() {
  cat << EOF
Beginner Investor Hub - Secret Generation Script

This script generates secure secrets for deployment.

USAGE:
  $0 [OPTIONS]

OPTIONS:
  --env-file FILE       Specify environment file (default: .env)
  --overwrite           Overwrite existing secrets
  --validate-only       Only validate existing secrets
  --format FORMAT       Output format: env|json|table (default: env)
  --help               Show this help message

EXAMPLES:
  # Generate all secrets to .env file
  $0

  # Generate secrets to custom file
  $0 --env-file .env.production

  # Only validate existing secrets
  $0 --validate-only

  # Generate and output as JSON
  $0 --format json

EOF
}

# Generate a secure random string of specified length (hex)
generate_hex_secret() {
  local length=$1
  openssl rand -hex $length
}

# Validate secret strength
validate_secret() {
  local secret=$1
  local min_length=${SECRET_REQUIREMENTS[$2]:-32}

  if [ ${#secret} -lt $min_length ]; then
    return 1
  fi

  # Check for character diversity
  local has_lower=$(echo "$secret" | grep -c "[a-z]" || true)
  local has_upper=$(echo "$secret" | grep -c "[A-Z]" || true)
  local has_number=$(echo "$secret" | grep -c "[0-9]" || true)
  local has_special=$(echo "$secret" | grep -c "[^a-zA-Z0-9]" || true)

  local diversity=$((has_lower + has_upper + has_number + has_special))

  if [ $diversity -lt 2 ]; then
    return 1
  fi

  return 0
}

# Load existing environment file if it exists
load_existing_env() {
  if [ -f "$ENV_FILE" ]; then
    log_info "Loading existing environment file: $ENV_FILE"
    source "$ENV_FILE" 2>/dev/null || true
  fi
}

# Check if secret already exists and is valid
secret_exists_and_valid() {
  local key=$1
  local value=${!key:-}

  if [ -z "$value" ]; then
    return 1
  fi

  validate_secret "$value" "$key"
}

# Generate all required secrets
generate_all_secrets() {
  declare -A new_secrets

  log_info "Generating secure secrets..."

  # Generate core secrets
  for secret_key in "${!SECRET_REQUIREMENTS[@]}"; do
    local required_length=${SECRET_REQUIREMENTS[$secret_key]}

    if ! $OVERWRITE && secret_exists_and_valid "$secret_key"; then
      log_info "✓ $secret_key already exists and is valid"
      continue
    fi

    local new_secret
    new_secret=$(generate_hex_secret $required_length)

    # Validate the generated secret
    if ! validate_secret "$new_secret" "$secret_key"; then
      log_error "Generated secret for $secret_key failed validation"
      exit 1
    fi

    new_secrets[$secret_key]="$new_secret"
    log_success "✓ Generated $secret_key (${#new_secret} characters)"
  done

  # Generate API keys
  for api_key in "${!API_KEY_PREFIXES[@]}"; do
    local prefix=${API_KEY_PREFIXES[$api_key]}

    if ! $OVERWRITE && secret_exists_and_valid "$api_key"; then
      log_info "✓ $api_key already exists and is valid"
      continue
    fi

    local random_part
    random_part=$(generate_hex_secret 16)  # 32 hex characters
    new_secrets[$api_key]="${prefix}${random_part}"
    log_success "✓ Generated $api_key"
  done

  echo
  return 0
}

# Output secrets in specified format
output_secrets() {
  local format=$1
  shift
  declare -A secrets=("$@")

  case $format in
    "env")
      for key in "${!secrets[@]}"; do
        echo "${key}=${secrets[$key]}"
      done
      ;;
    "json")
      echo "{"
      local first=true
      for key in "${!secrets[@]}"; do
        if [ "$first" = false ]; then
          echo ","
        fi
        echo "  \"$key\": \"${secrets[$key]}\""
        first=false
      done
      echo "}"
      ;;
    "table")
      echo "Secret Key | Length | Status"
      echo "-----------|--------|--------"
      for key in "${!secrets[@]}"; do
        local length=${#secrets[$key]}
        echo "$key | $length chars | ✓ Generated"
      done
      ;;
  esac
}

# Validate existing secrets
validate_existing_secrets() {
  local issues=0

  log_info "Validating existing secrets..."

  # Check core secrets
  for secret_key in "${!SECRET_REQUIREMENTS[@]}"; do
    local value=${!secret_key:-}

    if [ -z "$value" ]; then
      log_error "✗ $secret_key is missing"
      ((issues++))
      continue
    fi

    if ! validate_secret "$value" "$secret_key"; then
      log_warn "⚠ $secret_key is weak (${#value} characters)"
      ((issues++))
    else
      log_success "✓ $secret_key is valid (${#value} characters)"
    fi
  done

  # Check API keys
  for api_key in "${!API_KEY_PREFIXES[@]}"; do
    local value=${!api_key:-}

    if [ -z "$value" ]; then
      log_error "✗ $api_key is missing"
      ((issues++))
      continue
    fi

    log_success "✓ $api_key exists (${#value} characters)"
  done

  echo
  if [ $issues -eq 0 ]; then
    log_success "All secrets are valid!"
    return 0
  else
    log_error "Found $issues secret issues"
    return 1
  fi
}

# Update environment file
update_env_file() {
  declare -A new_secrets=("$@")

  if [ ${#new_secrets[@]} -eq 0 ]; then
    log_info "No new secrets to write"
    return 0
  fi

  # Create backup if file exists
  if [ -f "$ENV_FILE" ] && [ ${#new_secrets[@]} -gt 0 ]; then
    local backup_file="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$backup_file"
    log_info "Created backup: $backup_file"
  fi

  # Write new secrets to file
  for key in "${!new_secrets[@]}"; do
    if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
      # Update existing line
      sed -i.bak "s|^${key}=.*|${key}=${new_secrets[$key]}|" "$ENV_FILE"
    else
      # Add new line
      echo "${key}=${new_secrets[$key]}" >> "$ENV_FILE"
    fi
  done

  log_success "Updated $ENV_FILE with new secrets"
}

# Main execution
main() {
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      --env-file)
        ENV_FILE="$2"
        shift 2
        ;;
      --overwrite)
        OVERWRITE=true
        shift
        ;;
      --validate-only)
        VALIDATE_ONLY=true
        shift
        ;;
      --format)
        FORMAT="$2"
        shift 2
        ;;
      --help)
        show_help
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        show_help
        exit 1
        ;;
    esac
  done

  # Convert relative path to absolute
  if [[ "$ENV_FILE" != /* ]]; then
    ENV_FILE="$PROJECT_ROOT/$ENV_FILE"
  fi

  log_info "Environment file: $ENV_FILE"
  log_info "Format: $FORMAT"
  log_info "Overwrite existing: $OVERWRITE"
  log_info "Validate only: $VALIDATE_ONLY"

  # Load existing environment
  load_existing_env

  if [ "$VALIDATE_ONLY" = true ]; then
    validate_existing_secrets
    exit $?
  fi

  # Generate secrets
  if ! generate_all_secrets; then
    log_error "Failed to generate secrets"
    exit 1
  fi

  # Collect all secrets for output
  declare -A all_secrets
  for secret_key in "${!SECRET_REQUIREMENTS[@]}" "${!API_KEY_PREFIXES[@]}"; do
    local value=${!secret_key:-}
    if [ -n "$value" ]; then
      all_secrets[$secret_key]="$value"
    fi
  done

  # Output in requested format
  echo
  log_info "Generated secrets:"
  echo

  if [[ "$FORMAT" == "table" ]]; then
    output_secrets "table" "$(declare -p all_secrets 2>/dev/null | sed 's|declare -A all_secrets=||')"
  else
    output_secrets "$FORMAT" "$(declare -p all_secrets 2>/dev/null | sed 's|declare -A all_secrets=||')"
  fi

  # Update environment file
  update_env_file "$(declare -p all_secrets 2>/dev/null | sed 's|declare -A all_secrets=||')"

  echo
  log_success "Secret generation completed successfully!"
  log_warn "⚠️  Remember to rotate these secrets in production periodically"
}

# Run main function
main "$@"
