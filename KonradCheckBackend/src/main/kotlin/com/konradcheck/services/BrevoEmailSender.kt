package com.konradcheck.services

import java.io.IOException
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

class BrevoEmailSender : PasswordResetEmailSender {
    private val client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build()

    override fun validateConfiguration() {
        config()
    }

    override fun sendCode(recipient: String, code: String) {
        val config = config()
        val payload = buildJsonObject {
            put("sender", buildJsonObject {
                put("name", config.senderName)
                put("email", config.senderEmail)
            })
            put("to", buildJsonArray {
                add(buildJsonObject { put("email", recipient) })
            })
            put("subject", "Código para recuperar tu contraseña de KonradCheck")
            put(
                "textContent",
                "Tu código de recuperación es $code. Vence en 10 minutos. " +
                    "Si no solicitaste este cambio, ignora este correo.",
            )
            put(
                "htmlContent",
                "<p>Tu código de recuperación de KonradCheck es:</p>" +
                    "<p style=\"font-size:24px;font-weight:bold;letter-spacing:4px\">$code</p>" +
                    "<p>Vence en 10 minutos. Si no solicitaste este cambio, ignora este correo.</p>",
            )
        }
        val request = HttpRequest.newBuilder(URI.create(API_URL))
            .timeout(Duration.ofSeconds(15))
            .header("api-key", config.apiKey)
            .header("accept", "application/json")
            .header("content-type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(Json.encodeToString(JsonObject.serializer(), payload)))
            .build()

        val response = try {
            client.send(request, HttpResponse.BodyHandlers.ofString())
        } catch (error: InterruptedException) {
            Thread.currentThread().interrupt()
            throw PasswordResetDeliveryException("No se pudo enviar el código de recuperación.", error)
        } catch (error: IOException) {
            throw PasswordResetDeliveryException("No se pudo enviar el código de recuperación.", error)
        }

        if (response.statusCode() !in 200..299) {
            throw PasswordResetDeliveryException(
                "El proveedor de correo rechazó el envío (HTTP ${response.statusCode()}).",
            )
        }
    }

    private fun config(): Config {
        val apiKey = System.getenv("BREVO_API_KEY")?.takeIf(String::isNotBlank)
            ?: throw PasswordResetDeliveryException("Falta configurar BREVO_API_KEY.")
        val senderEmail = System.getenv("BREVO_SENDER_EMAIL")?.takeIf(String::isNotBlank)
            ?: throw PasswordResetDeliveryException("Falta configurar BREVO_SENDER_EMAIL.")
        val senderName = System.getenv("BREVO_SENDER_NAME")?.takeIf(String::isNotBlank) ?: "KonradCheck"
        return Config(apiKey, senderEmail, senderName)
    }

    private data class Config(val apiKey: String, val senderEmail: String, val senderName: String)

    private companion object {
        const val API_URL = "https://api.brevo.com/v3/smtp/email"
    }
}
