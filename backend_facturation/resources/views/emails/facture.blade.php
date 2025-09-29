<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture</title>
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
    <h1>Bonjour {{ $facture->client->nom }},</h1>

    <p>Merci pour votre commande. Veuillez trouver ci-joint votre facture <strong>n°{{ $facture->numero }}</strong>.</p>

    <p>Merci,<br>
    {{ $facture->entreprise->nom }}</p>
</body>
</html>
