<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>devis</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            font-size: 14px;
            line-height: 1.5;
        }
        strong {
            color: #007bff;
        }
    </style>
</head>
<body>
    <h1>Bonjour {{ $devis->client->nom }},</h1>

    <p>Merci . Veuillez trouver ci-joint votre devis <strong>n°{{ $devis->numero }}</strong>.</p>

    <p>Merci,<br>
    {{ $devis->entreprise->nom }}</p>
</body>
</html>
