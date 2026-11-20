package com.konradcheck.routes

import com.konradcheck.data.FirestoreRepository
import com.konradcheck.models.ConfirmarRecuperacionRequest
import com.konradcheck.models.EscanearRequest
import com.konradcheck.models.LoginRequest
import com.konradcheck.models.ProgramarReunionRequest
import com.konradcheck.models.SolicitarRecuperacionRequest
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

fun Application.configureRoutes(repository: FirestoreRepository) {
    routing {
        get("/health") {
            call.respond(HealthResponse("ok"))
        }

        route("/auth") {
            post("/password-reset/request") {
                val request = call.receive<SolicitarRecuperacionRequest>()
                call.respond(blockingCall { repository.requestPasswordReset(request.correo) })
            }
            post("/password-reset/confirm") {
                val request = call.receive<ConfirmarRecuperacionRequest>()
                call.respond(
                    blockingCall {
                        repository.confirmPasswordReset(
                            request.correo,
                            request.codigo,
                            request.nuevaContrasena,
                        )
                    },
                )
            }
            post("/login") {
                val request = call.receive<LoginRequest>()
                call.respond(blockingCall { repository.login(request) })
            }
            get("/me") {
                val token = call.bearerToken()
                call.respond(blockingCall { repository.currentUser(token) })
            }
            post("/logout") {
                val token = call.bearerToken()
                blockingCall { repository.logout(token) }
                call.respond(HttpStatusCode.NoContent)
            }
        }

        post("/demo/cuentas/{tipo}") {
            val type = call.parameters["tipo"]
                ?: throw IllegalArgumentException("Indica el tipo de cuenta demo.")
            call.respond(blockingCall { repository.ensureDemoData(type) })
        }

        route("/reuniones") {
            get {
                val token = call.bearerToken()
                call.respond(blockingCall { repository.listMeetings(token) })
            }
            post {
                val request = call.receive<ProgramarReunionRequest>()
                val token = call.bearerToken()
                call.respond(blockingCall { repository.scheduleMeeting(token, request) })
            }
            get("/{id}/reporte") {
                val token = call.bearerToken()
                val id = call.pathId()
                call.respond(blockingCall { repository.report(token, id) })
            }
            get("/{id}/ticket") {
                val token = call.bearerToken()
                val id = call.pathId()
                call.respond(blockingCall { repository.ticket(token, id) })
            }
            post("/{id}/asistencias/escanear") {
                val token = call.bearerToken()
                val id = call.pathId()
                val request = call.receive<EscanearRequest>()
                call.respond(blockingCall { repository.scan(token, id, request) })
            }
            get("/{id}/tickets-pendientes") {
                val token = call.bearerToken()
                val id = call.pathId()
                call.respond(blockingCall { repository.pendingTickets(token, id) })
            }
        }

        get("/estudiantes") {
            val token = call.bearerToken()
            call.respond(blockingCall { repository.listStudents(token) })
        }
        get("/estudiantes/me/historial") {
            val token = call.bearerToken()
            call.respond(blockingCall { repository.history(token) })
        }
    }
}

private suspend fun <T> blockingCall(action: () -> T): T =
    withContext(Dispatchers.IO) { action() }

private fun io.ktor.server.application.ApplicationCall.bearerToken(): String {
    val header = request.headers[HttpHeaders.Authorization]
        ?: throw com.konradcheck.UnauthorizedException()
    return header.removePrefix("Bearer ").takeIf { it != header && it.isNotBlank() }
        ?: throw com.konradcheck.UnauthorizedException()
}

private fun io.ktor.server.application.ApplicationCall.pathId(): String =
    parameters["id"]?.takeIf { it.isNotBlank() }
        ?: throw IllegalArgumentException("Falta el identificador de la reunión.")

@Serializable
private data class HealthResponse(val status: String)
