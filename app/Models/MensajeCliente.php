<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MensajeCliente extends Model
{
    use HasFactory;

    protected $table = 'mensajes_clientes'; // Nombre de tu tabla

    protected $fillable = [
        'nombre',
        'correo',
        'whatsapp',
        'mensaje',
        'ip_address',
    ];
}