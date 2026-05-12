#!/bin/bash
# Add feature routes to api.php

API_FILE="/var/www/pisantri-api/routes/api.php"

# Check if route already exists
if grep -q "settings/features" "$API_FILE"; then
    echo "Feature routes already exist"
    exit 0
fi

# Add import
sed -i 's/use App\\Http\\Controllers\\WebhookController;/use App\\Http\\Controllers\\WebhookController;\nuse App\\Http\\Controllers\\FeatureController;/' "$API_FILE"

# Find the last line with "})" and add routes before it
cat >> "$API_FILE" << 'ROUTES'

// Feature Settings (superadmin only for full access, active for all)
Route::get('/settings/features/active', [FeatureController::class, 'active']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/settings/features', [FeatureController::class, 'index']);
    Route::put('/settings/features/{key}', [FeatureController::class, 'toggle']);
    Route::put('/settings/features/{key}/schedule', [FeatureController::class, 'schedule']);
});
ROUTES

echo "Feature routes added successfully"
