#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Navigate to the correct destination directory first.
cd tools-restructured

# Create all necessary directories relative to the current location.
mkdir -p "tools/services/ai-behavioral-nudge-engine/src"
mkdir -p "tools/services/market-data-ingestion/src"
mkdir -p "tools/services/risk-calculation-engine/src"
mkdir -p "tools/services/backend-api/src"
mkdir -p "tools/services/shared"

# --- MIGRATION STEPS ---

# Copy files using relative paths.
# The source is "../tools" because we moved into "tools-restructured".

# Copy all files from the deprecated backend
cp -r "../tools/_deprecated_backend/." "./tools/services/backend-api"

# Copy all files from the current backend-api src
cp -r "../tools/backend/." "./tools/services/backend-api/src/"

# Copy other specific files
cp "../tools/apiCacheStore.ts" "./tools/services/shared/"
cp "../tools/asyncUtils.ts" "./tools/services/shared/"
cp "../tools/logger.ts" "./tools/services/shared/"
cp "../tools/objectUtils.ts" "./tools/services/shared/"
cp "../tools/tsconfig.json" "./tools/services/shared/"
cp "../tools/frontend/firebase-config-template.ts" "./tools/services/shared/"
cp "../tools/frontend/jest.config.js" "./tools/services/shared/"
cp "../tools/frontend/next.config.js" "./tools/services/shared/"
cp "../tools/frontend/postcss.config.js" "./tools/services/shared/"
cp "../tools/frontend/tailwind.config.js" "./tools/services/shared/tailwind.config.js"
cp "../tools/tools/apps/web/tailwind.config.ts" "./tools/services/shared/tailwind.config.ts"
cp "../tools/frontend/config/badges.ts" "./tools/services/shared/"
cp "../tools/frontend/store/utils.ts" "./tools/services/shared/"
cp "../tools/tools/packages/utils/src/formatters.test.ts" "./tools/services/shared/"
cp "../tools/tools/packages/utils/src/formatters.ts" "./tools/services/shared/"
cp "../tools/tools/packages/shared-utils/package.json" "./tools/services/shared/"
cp "../tools/tools/services/shared/config/base_config.py" "./tools/services/shared/"
cp "../tools/tools/services/shared/utils/database.py" "./tools/services/shared/"
cp "../tools/tools/services/shared/utils/logging.py" "./tools/services/shared/"
cp "../tools/tools/services/shared/requirements.txt" "./tools/services/shared/"
cp "../tools/tools/services/shared/docker/Dockerfile.template" "./tools/services/shared/"
cp "../tools/tools/services/shared/docker/docker-compose.template.yml" "./tools/services/shared/"
cp "../tools/tools/services/shared/service-template/README.md" "./tools/services/shared/"
cp "../tools/tools/services/shared/service-template/Tools - Shortcut.lnk" "./tools/services/shared/"
cp "../tools/behavioral_analytics.py" "./tools/services/ai-behavioral-nudge-engine/src/"
cp "../tools/nudge_optimization.py" "./tools/services/ai-behavioral-nudge-engine/src/"
cp "../tools/nudge.ts" "./tools/services/ai-behavioral-nudge-engine/src/"
cp "../tools/nudgeLogModel.ts" "./tools/services/ai-behavioral-nudge-engine/src/"
cp "../tools/marketDataModel.ts" "./tools/services/market-data-ingestion/src/"
cp "../tools/riskAssessmentStore.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/risk.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/risk-assessment-proxy.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/risk-assessment.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/riskAssessmentController.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/riskAssessmentValidation.test.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/riskProfileModel.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/useRiskAssessment.ts" "./tools/services/risk-calculation-engine/src/"
cp "../tools/error.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/loading.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/page.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/api.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/config.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/correlations.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/env.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/portfolio_simulator.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/risk_assessment_engine.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/test_risk_assessment_engine.py" "./tools/services/risk-calculation-engine/src/"
cp "../tools/frontend/components/MarketDataWidget.tsx" "./tools/services/market-data-ingestion/src/"
cp "../tools/frontend/components/NudgeChatWidget.tsx" "./tools/services/ai-behavioral-nudge-engine/src/"
cp "../tools/frontend/components/RiskAllocationPieChart.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/frontend/components/RiskAssessmentForm.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/frontend/components/RiskAssessmentResult.tsx" "./tools/services/risk-calculation-engine/src/"
cp "../tools/frontend/pages/api/nudge-engine-proxy.ts" "./tools/services/ai-behavioral-nudge-engine/src/"
cp "../tools/frontend/pages/api/risk-assessment-proxy.ts" "./tools/services/risk-calculation-engine/src/"