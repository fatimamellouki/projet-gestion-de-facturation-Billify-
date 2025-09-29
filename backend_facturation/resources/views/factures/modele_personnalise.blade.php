<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $facture->numero }}</title>
    <style>
        *{
            margin:0px 0px;
            padding:0px 0px;
            box-sizing:border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header { display: flex; justify-content: space-between; align-items: center;  margin:20px 0px; padding:0px 0px; }

        .entete {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .entete img {
            width: 100%;
        }
        .info-client, .info-entreprise {
            width: 45%;
        }
        .section {
            margin-bottom: 25px;
        }
        h1 {
            font-size: 20px;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            border:none;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #000000;

        }

        th {
            background-color: white;
            text-align: left;
        }
        th, td {
        padding:2px 0px 2px 20px;

        }
        .totaux-row {
            font-weight: bold;
            background-color: #ffffff;
        }
        .totaux-cell {
            text-align: right;
        }
        .totaux-value {
            text-align: left;
        }
        .objet, .mode-paiement {
            font-weight: bold;
            margin-top: 15px;
        }
        .mt-20 { margin-top: 20px; font-size: 15px; }
        .mb-10 { margin-bottom: 10px; font-size: 15px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #eee; padding: 8px 0; background-color: #fff; }
        .signature { height: 60px; max-width: 200px; }
        .signature-container { margin-top: 40px; text-align: right; }
        .logo { max-height: 80px; max-width: 100%; border-radius: 50px; background-color: #007bff; }
        .entete { width: 100%; max-height: 80px; object-fit: cover; border-radius: 10px; margin-top:0px; padding-top:0px; }
        .noborder{border:none;}
        .container{
            margin:10px 20px 10px 20px;
        }
    </style>
</head>
<body>
    <!-- En-tête -->
    @if(data_get($options, 'afficher_logo') && data_get($options, 'afficher_header'))
        <div class="header">
            <div>
                @if($facture->entreprise->entete_facture)
                    <img src="{{ public_path('storage/' . $facture->entreprise->entete_facture) }}" class="entete" alt="entete">
                @endif
            </div>
        </div>
    @elseif(data_get($options,'afficher_logo')&& $facture->entreprise->logo_url)
        <table style="width: 100%; margin-bottom: 10px; margin-top: 0px;">
            <tr>
                <td style="width: 50%; border:none; text-align:left;">
                    <div class="info-facture-gauche">
                        </div>
                </td>
                <td style="width: 50%; border:none; text-align:left;">
                    <div class="logo-container" style="text-align: right; margin-bottom: 10px; margin-top:0px; margin-right: 10px; padding-right: 5px;">
                        @if($facture->entreprise->logo_url)
                            <img src="{{ public_path('storage/' . $facture->entreprise->logo_url) }}" class="logo" alt="Logo">
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    @endif

    <h1>Facture N° {{ $facture->numero }}</h1>
<div class="container">
    <table>
        <thead>
        <tr>
            <th>
                @isset($objet)
                <strong>Objet :</strong>{{ $objet }}<br>
                @endisset
                <strong>Client :</strong> {{ $facture->client->nom }}<br>
                <strong>ICE:</strong> {{ $facture->entreprise->matricule_fiscale }}<br>
            </th>
            <th>
                <strong>Date :</strong> {{ \Carbon\Carbon::parse($facture->date_facture)->format('d/m/Y') }}<br>
            </th>
        </tr>
        </thead>
    </table>

    <table>
        <thead>
            <tr>
                <th>Désignation</th>
                <th>Quantité</th>
                <th>Prix Unitaire HT</th>
                <th>TVA</th>
                <th>Total TTC</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($facture->lignes as $ligne)
                <tr>
                    <td>{!! $ligne->designation !!}</td>
                    <td>{{ $ligne->quantite }}</td>
                    <td>{{ number_format($ligne->prix_unitaire_ht, 2) }} DH</td>
                    <td>{{ $ligne->montant_tva }}%</td>
                    <td>{{ number_format($ligne->montant_total_ttc, 2) }} DH</td>
                </tr>
            @endforeach

            <!-- Ligne Total HT -->
            <tr class="totaux-row">
                <td colspan="3" class='noborder'></td>
                <td  class="totaux-cell">Total HT :</td>
                <td  class="totaux-value">{{ number_format($facture->total_ht, 2) }} DH</td>
            </tr>

            <!-- Ligne Total TVA -->
            <tr class="totaux-row">
                <td colspan="3" class='noborder'></td>
                <td  class="totaux-cell">Total TVA :</td>
                <td  class="totaux-value">{{ number_format($facture->total_tva, 2) }} DH</td>
            </tr>

            <!-- Ligne Total TTC -->
            <tr class="totaux-row">
                <td colspan="3" class='noborder'></td>
                <td  class="totaux-cell">Total TTC :</td>
                <td  class="totaux-value">{{ number_format($facture->total_ttc, 2) }} DH</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 15px;">
        <p><strong>Montant en lettres :</strong> {{ $montantLettre }}</p>
    </div>

    <div>
        <strong>Mode de paiement :</strong>
        @if($facture->statut == 'payee')
            <span style="margin-left: 10px;">
                {{ optional($facture->paiements->firstWhere('id_facture', $facture->id_facture))->moyen ?? 'Non spécifié' }}
            </span>
        @else
            <span style="margin-left: 10px;">Non payé</span>
        @endif
    </div>

    <!-- Signature -->
    @if(data_get($options,'afficher_signature') && $facture->entreprise->signature_url)
        <div class="signature-container">
            <div>Signature :</div>
            <img src="{{ public_path('storage/' . $facture->entreprise->signature_url) }}" class="signature" alt="Signature">
        </div>
    @endif
    </div>
    <!-- Pied de page -->
    <div class="footer">
        @if(data_get($options,'afficher_footer'))
            @if($facture->entreprise->pied_facture)
                <img src="{{ public_path('storage/' . $facture->entreprise->pied_facture) }}" style="max-height: 40px; width: auto;">
            @else
                <div>{{ $facture->entreprise->nom }} - {{ $facture->entreprise->adresse }} - Tél: {{ $facture->entreprise->telephone }}</div>
            @endif
        @endif
    </div>
</body>
</html>
