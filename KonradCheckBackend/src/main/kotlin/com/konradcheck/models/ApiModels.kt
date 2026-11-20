package com.konradcheck.models

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(val correo: String, val contrasena: String)

@Serializable
data class SolicitarRecuperacionRequest(val correo: String)

@Serializable
data class ConfirmarRecuperacionRequest(
    val correo: String,
    val codigo: String,
    val nuevaContrasena: String,
)

@Serializable
data class MensajeResponse(val mensaje: String)

@Serializable
data class LoginResponse(val token: String, val usuario: UsuarioDto)

@Serializable
data class DemoAccountResponse(val correo: String, val contrasena: String)

@Serializable
data class UsuarioDto(
    val id: String,
    val codigo: String,
    val nombre: String,
    val correo: String,
    val rol: String,
    val area: String,
    val detalle: String,
)

@Serializable
data class ReunionDto(
    val id: String,
    val titulo: String,
    val tipo: String,
    val descripcion: String,
    val ubicacion: String,
    val inicio: Long,
    val fin: Long,
    val estado: String,
    val ticketDesde: Long,
    val escaneoActivo: Boolean,
    val asistencia: String? = null,
    val ticketDisponible: Boolean? = null,
    val registrados: Int? = null,
    val total: Int? = null,
)

@Serializable
data class ProgramarReunionRequest(
    val titulo: String,
    val tipo: String,
    val ubicacion: String,
    val descripcion: String = "",
    val inicio: Long,
    val fin: Long,
    val estudiantes: List<String>,
)

@Serializable
data class ProgramarReunionResponse(val reunion: ReunionDto)

@Serializable
data class EstudianteDto(
    val id: String,
    val codigo: String,
    val nombre: String,
    val correo: String,
)

@Serializable
data class ResumenAsistenciaDto(
    val total: Int,
    val registrados: Int,
    val presentes: Int,
    val tardanzas: Int,
    val ausentes: Int,
    val pendientes: Int,
)

@Serializable
data class AsistenciaEstudianteDto(
    val id: String,
    val nombre: String,
    val codigo: String,
    val correo: String,
    val estado: String,
    val registradoEn: Long? = null,
)

@Serializable
data class ReporteDto(
    val reunion: ReunionDto,
    val estudiantes: List<AsistenciaEstudianteDto>,
    val resumen: ResumenAsistenciaDto,
)

@Serializable
data class TicketDto(
    val id: String,
    val secreto: String? = null,
    val asistencia: String,
    val registradoEn: Long? = null,
)

@Serializable
data class TicketResponse(
    val ahora: Long,
    val pasoMs: Long,
    val reunion: ReunionDto,
    val ticket: TicketDto,
    val desfaseMs: Long = 0,
)

@Serializable
data class EscanearRequest(val codigo: String)

@Serializable
data class EstudianteEscaneoDto(val nombre: String, val codigo: String)

@Serializable
data class EscaneoResponse(
    val resultado: String,
    val mensaje: String,
    val estudiante: EstudianteEscaneoDto? = null,
    val estado: String? = null,
    val registrados: Int,
    val total: Int,
)

@Serializable
data class HistorialDto(
    val id: String,
    val titulo: String,
    val tipo: String,
    val inicio: Long,
    val estado: String,
    val registradoEn: Long? = null,
)

@Serializable
data class TicketPendienteDto(
    val id: String,
    val secreto: String,
    val nombre: String,
    val codigo: String,
)
