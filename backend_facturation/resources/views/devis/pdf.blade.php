<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <title>Devis {{ $devis->numero }} - {{ $devis->entreprise->nom }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, html { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; margin: 10px 20px; }
        .page { width: 100%; padding: 10px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; margin-top:0px; padding-top:0px; }
        .info-facture { width: 65%; text-align: center; font-size: 22px; font-weight: bold; align-self: center; }
        .info-facture-gauche { width: 60%; text-align: left; }
        .numero-facture { font-size: 22px; font-weight: bold; color: #007bff; }
        .entete { width: 100%; max-height: 80px; object-fit: cover; border-radius: 10px; margin-top:0px; padding-top:0px; }
        .logo-container { text-align: right; margin: 0 10px; padding: 0; }
        .logo { max-height: 80px; max-width: 100%; border-radius: 50px; background-color: #007bff; }
        .section { margin-top: 25px; margin-bottom: 25px; }
        .section-title { padding: 8px 10px; font-weight: bold; font-size: 20px; color: #007bff; border-bottom: 1px solid #ccc; margin-bottom: 10px; }
        .flex-table { display: flex; justify-content: space-between; width: 100%; }
        .flex-col { width: 48%; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 13px; margin-top: 10px; }
        thead { background-color: #007bff; color: white; }
        th, td { border: 1px solid #ddd; padding: 8px 6px; text-align: center; word-wrap: break-word; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .totals { width: 60%; margin-left: auto; margin-top: 20px; font-size: 14px; }
        .total-line { display: flex; justify-content: space-between; padding: 6px 0; }
        .grand-total { border-top: 2px solid #007bff; padding-top: 6px; font-weight: bold; font-size: 16px; }
        .signature-container { margin-top: 40px; text-align: right; }
        .signature { height: 60px; max-width: 200px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 11px; color: #777; text-align: center; border-top: 1px solid #eee; padding: 8px 0; background-color: #fff; }
        .mb-10 { margin-bottom: 10px; font-size: 15px; }
        .mt-20 { margin-top: 20px; font-size: 15px; }
    </style>
</head>
<body>
    <div class="page">
        <!-- En-tête -->
        @if(($options['afficher_logo'] && $options['afficher_header']) || $options['afficher_header'])
            <div class="header">
                <div>
                    @if($devis->entreprise->entete_facture)
                        <img src="{{ public_path('storage/' . $devis->entreprise->entete_facture) }}" class="entete" alt="entete">
                    @endif
                </div>
                <div class="info-facture">
                    <div class="numero-facture">Devis N° {{ $devis->numero }}</div>
                    <div class="date">Date: {{ $devis->date_devis }}</div>
                </div>
            </div>
        @elseif($options['afficher_logo'] && $devis->entreprise->logo_url)
            <table style="width: 100%; margin-bottom: 10px; margin-top: 0px;">
                <tr>
                    <td style="width: 50%; border:none; text-align:left;">
                        <div class="info-facture-gauche">
                            <div class="numero-facture">Devis N° {{ $devis->numero }}</div>
                            <div class="date">Date : {{ $devis->date_devis }}</div>
                        </div>
                    </td>
                    <td style="width: 50%; border:none; text-align:left;">
                        <div class="logo-container" style="text-align: right; margin-bottom: 10px; margin-top:0px; margin-right: 10px; padding-right: 5px;">
                            @if($devis->entreprise->logo_url)
                                <img src="{{ public_path('storage/' . $devis->entreprise->logo_url) }}" class="logo" alt="Logo">
                            @endif
                        </div>
                    </td>
                </tr>
            </table>
        @endif

        <!-- Émetteur / Destinataire -->
        <div class="section">
            <div class="section-title">Informations</div>
            <table style="width: 100%; border: none; font-size: 14px;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <strong>Émetteur</strong><br>
                        Société : {{ $devis->entreprise->nom }}<br>
                        Adresse : {{ $devis->entreprise->adresse }}<br>
                        Email : {{ $devis->entreprise->email }}<br>
                        @if($devis->entreprise->matricule_fiscale)
                            Matricule fiscale : {{ $devis->entreprise->matricule_fiscale }}<br>
                        @endif
                    </td>
                    <td style="width: 50%; vertical-align: top;">
                        <strong>Destinataire</strong><br>
                        Nom : {{ $devis->client->nom }}<br>
                        Adresse : {{ $devis->client->adresse }}<br>
                        Tél : {{ $devis->client->telephone }}<br>
                        Email : {{ $devis->client->email }}<br>
                    </td>
                </tr>
            </table>
        </div>

        <div style="margin:0px 15px;">
            <!-- Détails devis -->
            <div class="section">
                <div class="section-title">DÉTAIL DE LA Devis</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 30%;">Désignation</th>
                            <th style="width: 10%;">Qté</th>
                            <th style="width: 15%;">PU HT</th>
                            <th style="width: 10%;">Remise</th>
                            <th style="width: 10%;">TVA</th>
                            <th style="width: 25%;">Total TTC</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($devis->lignes as $ligne)
                            <tr>
                                <td class="text-left">{!! $ligne->designation !!}</td>
                                <td>{{ $ligne->quantite }}</td>
                                <td class="text-right">{{ number_format($ligne->prix_unitaire_ht, 2, ',', ' ') }} DH</td>
                                <td>{{ $ligne->remise_pourcentage }}%</td>
                                <td>{{ $ligne->montant_tva }}%</td>
                                <td class="text-right">{{ number_format($ligne->montant_total_ttc, 2, ',', ' ') }} DH</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Totaux -->
            <div class="totals">
                <div class="total-line">
                    <span>Total HT :</span>
                    <span>{{ number_format($devis->total_ht, 2, ',', ' ') }} DH</span>
                </div>
                <div class="total-line">
                    <span>Total TVA :</span>
                    <span>{{ number_format($devis->total_tva, 2, ',', ' ') }} DH</span>
                </div>
                <div class="total-line grand-total">
                    <span>Total TTC :</span>
                    <span>{{ number_format($devis->total_ttc, 2, ',', ' ') }} DH</span>
                </div>
                @if(isset($montantLettre))
                    <div class="mt-20 mb-10">
                        <strong>Montant en lettres :</strong><br>
                        <em>{{ $montantLettre }}</em>
                    </div>
                @endif
            </div>

            <!-- Signature -->
            @if($options['afficher_signature'] && $devis->entreprise->signature_url)
                <div class="signature-container">
                    <div>Signature :</div>
                    <img src="{{ public_path('storage/' . $devis->entreprise->signature_url) }}" class="signature" alt="Signature">
                </div>
            @endif
        </div>

        <!-- Pied de page -->
        <div class="footer">
            @if($options['afficher_footer'])
                @if($devis->entreprise->pied_facture)
                    <img src="{{ public_path('storage/' . $devis->entreprise->pied_facture) }}" style="max-height: 40px; width: auto;">
                @else
                    <div>{{ $devis->entreprise->nom }} - {{ $devis->entreprise->adresse }} - Tél: {{ $devis->entreprise->telephone }}</div>
                @endif
            @endif
        </div>
    </div>
</body>
</html>
