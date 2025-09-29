<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class DemandeAccesController extends Controller
{
    public function envoyer(Request $request)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20',
            'email' => 'required|email',
            'adresse' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:500',
            'recaptcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // 2. Vérification reCAPTCHA
        $recaptchaSecret = '6LfzdYkrAAAAAEEt7Df2hnxQdGADv-lJa6usl5Ev'; // ⚠️ à remplacer
        $recaptchaResponse = Http::asForm()->post("https://www.google.com/recaptcha/api/siteverify", [
            'secret' => $recaptchaSecret,
            'response' => $data['recaptcha'],
        ]);

        if (!$recaptchaResponse->json('success')) {
            return response()->json(['message' => 'Échec du reCAPTCHA'], 422);
        }

        // 3. Envoi de l’e-mail
        $message = "Nouvelle demande d’accès :\n\n";
        $message .= "Nom: " . $data['nom'] . "\n";
        $message .= "Prénom: " . $data['prenom'] . "\n";
        $message .= "Téléphone: " . $data['telephone'] . "\n";
        $message .= "Email: " . $data['email'] . "\n";
        $message .= "Adresse: " . ($data['adresse'] ?? '-') . "\n";
        $message .= "Message: " . ($data['message'] ?? '-') . "\n";

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

        Mail::raw($message, function ($msg) use ($data) {
            $msg->to('fatima.mellouki1@usmba.ac.ma')
                ->subject('Nouvelle demande d’accès de ' . $data['prenom'] . ' ' . $data['nom']);
        });

        return response()->json(['message' => 'Demande envoyée avec succès']);
    }
    public function envoyerContact(Request $request)
    {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'email' => 'required|email',
            'company' => 'nullable|string|max:100',
            'jobTitle' => 'nullable|string|max:100',
            'country' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'message' => 'nullable|string|max:500',
            'recaptcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // 2. Vérification reCAPTCHA
        $recaptchaSecret = '6LfzdYkrAAAAAEEt7Df2hnxQdGADv-lJa6usl5Ev'; // ⚠️ à remplacer
        $recaptchaResponse = Http::asForm()->post("https://www.google.com/recaptcha/api/siteverify", [
            'secret' => $recaptchaSecret,
            'response' => $data['recaptcha'],
        ]);

        if (!$recaptchaResponse->json('success')) {
            return response()->json(['message' => 'Échec du reCAPTCHA'], 422);
        }

        // 3. Envoi de l’e-mail
        $message = "Nouvelle demande d’accès :\n\n";
        $message .= "Nom: " . $data['firstName'] . "\n";
        $message .= "Prenom: " . $data['lastName'] . "\n";
        $message .= "Téléphone: " . $data['phone'] . "\n";
        $message .= "Email: " . $data['email'] . "\n";
        $message .= "job Title: " . ($data['jobTitle'] ?? '-') . "\n";
        $message .= "company: " . ($data['company'] ?? '-') . "\n";
        $message .= "country: " . ($data['country'] ?? '-') . "\n";
        $message .= "Message: " . ($data['message'] ?? '-') . "\n";

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

        Mail::raw($message, function ($msg) use ($data) {
            $msg->to('fatima.mellouki1@usmba.ac.ma')
                ->subject('Recevoir un contact a partir de ' . $data['firstName'] . ' ' . $data['lastName']);
        });

        return response()->json(['message' => 'contact envoyée avec succès']);
    }
}
