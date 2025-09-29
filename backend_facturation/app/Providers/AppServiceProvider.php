<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('loginLimit', function (Request $request) {
            return Limit::perHour(5)->by($request->ip());
        });

        RateLimiter::for('demandeAccesLimit', function (Request $request) {
            return Limit::perHour(7)->by($request->ip());
        });
    }
}
