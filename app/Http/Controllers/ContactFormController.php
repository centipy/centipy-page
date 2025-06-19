<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MensajeCliente;
use Illuminate\Support\Facades\RateLimiter; // Para el control de tasa
use Illuminate\Validation\ValidationException; // Para manejar errores de validación
use Illuminate\Support\Facades\Log; // Para registrar errores

class ContactFormController extends Controller
{
    public function submit(Request $request)
    {
        // Control de tasa (Rate Limiting) similar a tu implementación actual
        // Usaremos la IP como identificador para limitar
        $key = 'send-message-'.$request->ip();
        $decayMinutes = 1; // 1 minuto (equivale a 60 segundos)
        $maxAttempts = 1; // Solo 1 intento por minuto

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $secondsLeft = RateLimiter::availableIn($key);
            return response()->json([
                'status' => 'error',
                'message' => "Demasiados envíos en un corto período de tiempo. Por favor, inténtalo de nuevo en {$secondsLeft} segundos."
            ], 429); // Código de estado HTTP 429 para "Too Many Requests"
        }

        // Incrementar el contador de intentos
        RateLimiter::hit($key, $decayMinutes * 60); // decayMinutes en segundos


        try {
            // 1. Validación de los datos
            $request->validate([
                'nombre' => 'required|string|max:255',
                'correo' => 'required|email|max:255',
                'telefono' => 'nullable|string|max:50', // Whatsapp es opcional
                'asunto' => 'required|string|max:255',
                'mensaje' => 'required|string|max:2000',
            ], [
                'nombre.required' => 'Por favor, ingresa tu nombre completo.',
                'correo.required' => 'Necesitamos tu correo electrónico para contactarte.',
                'correo.email' => 'Por favor, ingresa un formato de correo electrónico válido.',
                'mensaje.required' => '¡No olvides escribir tu mensaje!',
                'asunto.required' => 'Por favor, ingresa un asunto para tu mensaje.',
            ]);

            // 2. Guardar el mensaje en la base de datos
            MensajeCliente::create([
                'nombre' => $request->nombre,
                'correo' => $request->correo,
                'whatsapp' => $request->telefono,
                'mensaje' => $request->mensaje,
                'ip_address' => $request->ip(), // Obtener la IP del usuario
            ]);

            // 3. Respuesta exitosa
            return response()->json([
                'status' => 'success',
                'message' => '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.'
            ]);

        } catch (ValidationException $e) {
            // Errores de validación
            return response()->json([
                'status' => 'error',
                'message' => $e->validator->errors()->first() // Obtener el primer error de validación
            ], 422); // Código de estado HTTP 422 para "Unprocessable Entity"
        } catch (\Exception $e) {
            // Otros errores del servidor
            Log::error('Error al procesar el formulario de contacto: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Ocurrió un error inesperado al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.'
            ], 500); // Código de estado HTTP 500 para "Internal Server Error"
        }
    }
}