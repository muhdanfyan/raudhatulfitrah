<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Load tenant config from env file: /etc/pisantri/tenants/<tenant>.env
     * Returns array with keys: database, cloudinary (cloud_name, api_key, api_secret, upload_preset)
     */
    private function loadTenantConfig(string $tenantId): ?array
    {
        $envPath = "/etc/pisantri/tenants/{$tenantId}.env";
        if (!file_exists($envPath)) {
            return null;
        }
        $vars = [];
        foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            [$key, $value] = array_map('trim', explode('=', $line, 2));
            $vars[$key] = $value;
        }
        // Map to config array
        return [
            'database' => $vars['DB_DATABASE'] ?? null,
            'cloudinary' => [
                'cloud_name' => $vars['CLOUDINARY_CLOUD_NAME'] ?? null,
                'api_key' => $vars['CLOUDINARY_API_KEY'] ?? null,
                'api_secret' => $vars['CLOUDINARY_API_SECRET'] ?? null,
                'upload_preset' => $vars['CLOUDINARY_UPLOAD_PRESET'] ?? ($tenantId),
            ],
            // Tambahkan key lain jika perlu
        ];
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->header('X-Tenant-ID');
        // Jika tidak ada header, gunakan default
        if (!$tenantId) {
            return $next($request);
        }
        $config = $this->loadTenantConfig($tenantId);
        if (!$config || !$config['database']) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid tenant ID or config not found',
            ], 400);
        }
        // Switch database connection
        Config::set('database.connections.mysql.database', $config['database']);
        DB::purge('mysql');
        DB::reconnect('mysql');
        // Switch Cloudinary config
        Config::set('cloudinary.cloud_name', $config['cloudinary']['cloud_name'] ?? '');
        Config::set('cloudinary.api_key', $config['cloudinary']['api_key'] ?? '');
        Config::set('cloudinary.api_secret', $config['cloudinary']['api_secret'] ?? '');
        Config::set('cloudinary.upload_preset', $config['cloudinary']['upload_preset'] ?? '');
        // Store tenant info in app container
        app()->instance('tenant', [
            'id' => $tenantId,
            'database' => $config['database'],
            'cloudinary' => $config['cloudinary'],
        ]);
        return $next($request);
    }
}
