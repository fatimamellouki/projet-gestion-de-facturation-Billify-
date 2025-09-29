<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | Définit le guard par défaut et le broker pour la réinitialisation des mots de passe.
    | Les valeurs sont récupérées depuis le fichier .env ou utilisent des valeurs par défaut.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'utilisateurs'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Configuration des guards, qui gèrent la façon dont les utilisateurs sont authentifiés.
    | Ici on utilise le guard "web" avec le driver "session" et le provider "users".
    |
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'utilisateurs',
        ],
        'api' => [
        'driver' => 'sanctum',
        'provider' => 'utilisateurs',
    ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | Définit comment récupérer les utilisateurs depuis la base de données.
    | Le provider "users" utilise le driver eloquent et le modèle Utilisateur.
    |
    */

    'providers' => [
        'utilisateurs' => [
            'driver' => 'eloquent',
            // IMPORTANT : enlever env() ici et mettre directement le modèle
            'model' => App\Models\Utilisateur::class,
        ],
        /*
        // Si tu utilises la table "users" avec le driver database :
        'users' => [
            'driver' => 'database',
            'table' => 'users',
        ],
        */
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | Configuration pour la réinitialisation des mots de passe.
    | Assure-toi que la table correspond bien à celle dans ta base (souvent "password_resets")
    |
    */

    'passwords' => [
        'utilisateurs' => [
            'provider' => 'utilisateurs',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_resets'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    |
    | Durée (en secondes) avant expiration de la confirmation du mot de passe.
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
