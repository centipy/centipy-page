<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactFormController; // Importa tu nuevo controlador

Route::get('/', function () {
    return view('welcome');
});

// Ruta para el envío del formulario de contacto
Route::post('/submit-contact-form', [ContactFormController::class, 'submit'])->name('contact.submit');