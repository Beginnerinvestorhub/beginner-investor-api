#!/bin/bash

# This script sets up monitoring for the Beginner Investor Hub application

set -e

# Create necessary directories
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/alertmanager
mkdir -p monitoring/blackbox

# Create Grafana datasource configuration
cat > monitoring/grafana/provisioning/datasources/datasource.yml << EOF
# config file version
apiVersion: 1

# List of datasources to insert/update
# <string, required> name of the datasource. Required
datasources:
  # <string, required> name of the datasource. Required
- name: Prometheus
  type: prometheus
  # Access mode - proxy (server in the UI) or direct (browser in the UI).
  access: proxy
  # <string, required> url to access the datasource. Required
  url: http://prometheus:9090
  # <string> jsonData of the datasource. Optional
  jsonData:
    timeInterval: "5s"
  # <string> UID of the datasource. Optional, will be generated if not provided
  # <int> version of the datasource. If not set, the most recent version will be used
  version: 1
  # <boolean> allow users to edit datasources from the UI.
  editable: true

- name: Alertmanager
  type: camptocamp-prometheus-alertmanager-datasource
  access: proxy
  url: http://alertmanager:9093
  jsonData:
    timeInterval: "5s"
  version: 1
  editable: true
EOF

# Create Blackbox configuration
cat > monitoring/blackbox/blackbox.yml << EOF
modules:
  http_2xx:
    prober: http
    http:
      preferred_ip_protocol: "ip4"
      tls_config:
        insecure_skip_verify: true
  tcp_connect:
    prober: tcp
  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"
EOF

# Create .env file for monitoring
cat > monitoring/.env << EOF
# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin

# Alerting
ALERT_EMAIL_FROM=alerts@beginnerinvestorhub.com
ALERT_EMAIL_TO=devops@beginnerinvestorhub.com
ALERT_EMAIL_USER=alerts@beginnerinvestorhub.com
ALERT_EMAIL_PASSWORD=your-email-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=beginner_investor_hub

# App Services
BACKEND_API_URL=http://backend-api:3000
FRONTEND_URL=http://frontend:3000
REDIS_URL=redis://redis:6379
EOF

echo "✅ Monitoring setup complete!"
echo "To start monitoring, run: docker-compose -f monitoring/docker-compose.yml up -d"
echo "Access Grafana at http://localhost:3001 (default credentials: admin/admin)"
echo "Access Prometheus at http://localhost:9090"
