<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<h1>Bonjour {{ $facture->client->nom }}</h1>

<p>Nous vous rappelons que la facture n° {{ $facture->numero }} est arrivée à échéance le {{ \Carbon\Carbon::parse($facture->date_echeance)->format('d/m/Y') }}.</p>

<p>Merci de procéder au règlement dès que possible.</p>

<p>Cordialement,<br>L'équipe</p>

</body>
</html>
