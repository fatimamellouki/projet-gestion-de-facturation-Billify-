<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Models\Utilisateur;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $token = Str::random(60);

        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $resetLink = $frontendUrl . "/reset-password?token=$token&email=" . urlencode($request->email);
 // Configuration manuelle
        config([
            'mail.mailers.smtp.host' => 'smtp.gmail.com',
            'mail.mailers.smtp.port' => 587,
            'mail.mailers.smtp.username' => 'fatimamellouki307@gmail.com',
            'mail.mailers.smtp.password' => 'euofdfcrpdscisaf',
            'mail.mailers.smtp.encryption' => 'tls',
            'mail.from.address' => 'billify.contact@gmail.com',
            'mail.from.name' => 'Billify',
        ]);

        Mail::raw("Cliquez sur ce lien pour réinitialiser votre mot de passe : $resetLink", function ($message) use ($request) {
            $message->to($request->email);
            $message->subject("Réinitialisation du mot de passe");
        });

        return response()->json(['message' => 'Email envoyé avec succès !']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|confirmed|min:6',
        ]);

        $reset = DB::table('password_resets')->where('email', $request->email)->first();

        if (!$reset || !Hash::check($request->token, $reset->token)) {
            return response()->json(['message' => 'Token invalide.'], 400);
        }

        $utilisateur = Utilisateur::where('email', $request->email)->first();
        if (!$utilisateur) return response()->json(['message' => 'Utilisateur non trouvé.'], 404);

        $utilisateur->passwordLogin = Hash::make($request->password);
        $utilisateur->save();

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès !']);
    }
}
