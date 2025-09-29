<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Avoir;
use Illuminate\Support\Facades\Auth;

class AvoirController extends Controller
{
  public function index()
{ $user = Auth::user();
    $entrepriseId = $user->entreprise_id;

    try {
        $avoirs = Avoir::whereHas('facture', function ($query) use ($entrepriseId) {
            $query->where('id_entreprise', $entrepriseId);
        })
        ->with('facture.client')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $avoirs
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur : ' . $e->getMessage()
        ], 500);
    }
}


    public function store(Request $request)
    {
        $request->validate([
            'numero' => 'required|string|max:50',
            'date_emission' => 'required|date',
            'motif' => 'required|string',
            'total_tcc' => 'required|numeric|min:0',  // Empêche les valeurs nulles
            'id_facture' => 'required|exists:factures,id_facture',
        ]);

   $avoir = new Avoir();
    $avoir->forceFill([
        'numero' => $request->input('numero'),
        'date_emission' => $request->input('date_emission'),
        'motif' => $request->input('motif'),
        'total_tcc' => (float)$request->input('total_tcc'), // Conversion forcée
        'id_facture' => $request->input('id_facture'),
    ])->save();

    return response()->json($avoir, 201);
    }
}
