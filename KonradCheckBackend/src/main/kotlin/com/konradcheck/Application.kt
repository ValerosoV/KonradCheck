package com.konradcheck

import com.konradcheck.config.FirebaseConfig
import com.konradcheck.data.FirestoreRepository
import com.konradcheck.routes.configureRoutes
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.BadRequestException
import io.ktor.server.plugins.ContentTransformationException
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.plugins.cors.routing.CORS
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respond
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("KonradCheck")

fun Application.module() {
    val repository = FirestoreRepository(FirebaseConfig.firestore())

    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            explicitNulls = false
        })
    }
    install(CORS) {
        anyHost()
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
    }
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse(cause.message ?: "Solicitud inválida."))
        }
        exception<UnauthorizedException> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, ErrorResponse(cause.message ?: "Inicia sesión."))
        }
        exception<ForbiddenException> { call, cause ->
            call.respond(HttpStatusCode.Forbidden, ErrorResponse(cause.message ?: "Acceso denegado."))
        }
        exception<NotFoundException> { call, cause ->
            call.respond(HttpStatusCode.NotFound, ErrorResponse(cause.message ?: "No encontrado."))
        }
        exception<BadRequestException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse(cause.message ?: "Solicitud inválida."))
        }
        exception<ContentTransformationException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse(cause.message ?: "El cuerpo no es válido."))
        }
        exception<SerializationException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse(cause.message ?: "El cuerpo no es válido."))
        }
        exception<Throwable> { call, cause ->
            logger.error("Error procesando ${call.request.local.uri}", cause)
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("No se pudo completar la solicitud."))
        }
    }
    configureRoutes(repository)
}

@kotlinx.serialization.Serializable
data class ErrorResponse(val error: String)

class UnauthorizedException(message: String = "Inicia sesión.") : RuntimeException(message)

class ForbiddenException(message: String = "No tienes acceso a esta función.") : RuntimeException(message)

class NotFoundException(message: String = "No se encontró el registro solicitado.") : RuntimeException(message)
