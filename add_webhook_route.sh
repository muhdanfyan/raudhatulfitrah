#!/bin/bash
# Add webhook route to api.php

API_FILE="/var/www/pisantri-api/routes/api.php"

# Check if route already exists
if grep -q "webhook/deploy" "$API_FILE"; then
    echo "Webhook route already exists"
    exit 0
fi

# Add route after the use statements (line 20)
sed -i '20a\\n// Webhook route (no auth required)\nRoute::post("/webhook/deploy", [\\App\\Http\\Controllers\\WebhookController::class, "deploy"]);' "$API_FILE"

echo "Webhook route added successfully"
