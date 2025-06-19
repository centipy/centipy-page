<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mensajes_clientes', function (Blueprint $table) {
            $table->id(); // Columna auto-incrementable (por defecto en Laravel)
            $table->string('nombre');
            $table->string('correo');
            $table->string('whatsapp')->nullable(); // Es opcional en tu formulario
            $table->text('mensaje');
            $table->string('ip_address')->nullable(); // Para el control de spam
            $table->timestamps(); // Esto crea `created_at` y `updated_at` automáticamente
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes_clientes');
    }
};