package com.konradcheck.data

import com.google.cloud.firestore.DocumentReference
import com.google.cloud.firestore.DocumentSnapshot
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.SetOptions
import com.konradcheck.ForbiddenException
import com.konradcheck.NotFoundException
import com.konradcheck.UnauthorizedException
import com.konradcheck.domain.LATE_AFTER_MS
import com.konradcheck.domain.QR_STEP_MS
import com.konradcheck.domain.QR_TOLERANCE_STEPS
import com.konradcheck.domain.TICKET_WINDOW_MS
import com.konradcheck.domain.attendanceState
import com.konradcheck.domain.currentHourWindow
import com.konradcheck.domain.enrollmentDocumentId
import com.konradcheck.domain.isTicketWindowOpen
import com.konradcheck.domain.meetingState
import com.konradcheck.domain.sha256Hex
import com.konradcheck.domain.signaturesMatch
import com.konradcheck.domain.signQrStep
import com.konradcheck.models.AsistenciaEstudianteDto
import com.konradcheck.models.DemoAccountResponse
import com.konradcheck.models.EscanearRequest
import com.konradcheck.models.EscaneoResponse
import com.konradcheck.models.EstudianteDto
import com.konradcheck.models.EstudianteEscaneoDto
import com.konradcheck.models.HistorialDto
import com.konradcheck.models.LoginRequest
import com.konradcheck.models.LoginResponse
import com.konradcheck.models.ProgramarReunionRequest
import com.konradcheck.models.ProgramarReunionResponse
import com.konradcheck.models.ReunionDto
import com.konradcheck.models.ReporteDto
import com.konradcheck.models.ResumenAsistenciaDto
import com.konradcheck.models.TicketDto
import com.konradcheck.models.TicketPendienteDto
import com.konradcheck.models.TicketResponse
import com.konradcheck.models.UsuarioDto
import java.time.Instant
import java.time.ZoneId
import java.util.UUID

private const val USERS = "usuarios"
private const val STUDENTS = "estudiantes"
private const val STAFF = "personal"
private const val PROGRAMS = "programas"
private const val COURSES = "asignaturas"
private const val MEETINGS = "reuniones"
private const val ENROLLMENTS = "inscripciones"
private const val SESSIONS = "sesiones"
private const val DEMO_PASSWORD = "Konrad123"
private const val DEMO_STUDENT_ID = "demo-estudiante"
private const val DEMO_STAFF_ID = "demo-docente"
private const val DEMO_PROGRAM_ID = "programa-demo"
private const val DEMO_COURSE_ID = "asignatura-demo"
private const val ACTIVE_MEETING_ID = "reunion-demo-activa"
private const val FINISHED_MEETING_ID = "reunion-demo-finalizada"
private const val FUTURE_MEETING_ID = "reunion-demo-futura"

private data class StudentSeed(
    val id: String,
    val codigo: String,
    val nombre: String,
    val correo: String,
    val canLogin: Boolean = false,
)

private data class MeetingSeed(
    val id: String,
    val titulo: String,
    val tipo: String,
    val descripcion: String,
    val ubicacion: String,
    val inicio: Long,
    val fin: Long,
    val cursoId: String?,
)

private data class EnrollmentSeed(
    val id: String,
    val reunionId: String,
    val estudianteId: String,
    val estado: String?,
    val registradoEn: Long?,
)

class FirestoreRepository(private val db: Firestore) {
    private val studentsInCsv = listOf(
        StudentSeed(DEMO_STUDENT_ID, "22019483", "David Gómez", "david.gomez@konradlorenz.edu.co", true),
        StudentSeed("estudiante-22014389", "22014389", "María Camila Restrepo", "maria.restrepo@konradlorenz.edu.co"),
        StudentSeed("estudiante-22011207", "22011207", "Andrés Felipe Rojas", "andres.rojas@konradlorenz.edu.co"),
        StudentSeed("estudiante-21908432", "21908432", "Diana Carolina Martínez", "diana.martinez@konradlorenz.edu.co"),
    )

    fun ensureDemoData(accountType: String): DemoAccountResponse {
        require(accountType == "estudiante" || accountType == "docente") {
            "El tipo de cuenta demo debe ser estudiante o docente."
        }
        seedDemoData()
        val email = if (accountType == "estudiante") {
            "david.gomez@konradlorenz.edu.co"
        } else {
            "armando.casas@konradlorenz.edu.co"
        }
        val user = db.collection(USERS)
            .whereEqualTo("correo", email)
            .limit(1)
            .get()
            .get()
            .documents
            .firstOrNull()
            ?.dataOrEmpty()
            ?: throw IllegalStateException("No se pudo confirmar la cuenta demo en Firestore.")
        return DemoAccountResponse(
            correo = user.string("correo"),
            contrasena = DEMO_PASSWORD,
        )
    }

    fun login(request: LoginRequest): LoginResponse {
        val email = request.correo.trim().lowercase()
        require(email.isNotBlank() && request.contrasena.isNotBlank()) {
            "Ingresa tu correo institucional y tu contraseña."
        }
        val user = db.collection(USERS)
            .whereEqualTo("correo", email)
            .limit(1)
            .get()
            .get()
            .documents
            .firstOrNull()
            ?: throw UnauthorizedException("Correo o contraseña incorrectos.")
        val data = user.dataOrEmpty()
        val actualHash = data.optionalString("passwordHash")
        if (actualHash == null || actualHash != sha256Hex(request.contrasena)) {
            throw UnauthorizedException("Correo o contraseña incorrectos.")
        }

        val token = UUID.randomUUID().toString()
        db.collection(SESSIONS).document(token).set(
            mapOf("usuarioId" to user.id),
        ).get()
        return LoginResponse(token, userDto(user.id, data))
    }

    fun currentUser(token: String): UsuarioDto = authenticatedUser(token).let { (id, data) -> userDto(id, data) }

    fun logout(token: String) {
        val session = db.collection(SESSIONS).document(token).get().get()
        if (session.exists()) session.reference.delete().get()
    }

    fun listMeetings(token: String): List<ReunionDto> {
        val (userId, user) = authenticatedUser(token)
        val now = System.currentTimeMillis()
        if (isStaff(user)) {
            val all = db.collection(MEETINGS).get().get().documents
                .filter { user.string("rol") == "administrativo" || it.getString("docenteId") == userId }
                .map { meeting ->
                    val counts = attendanceSummary(meeting.id, meeting.getLong("fin") ?: 0L, now)
                    meetingDto(meeting, now, counts)
                }
            return all.sortedWith(compareBy<ReunionDto>({ meetingOrder(it.estado) }, { it.inicio }))
        }

        val todayStart = Instant.ofEpochMilli(now)
            .atZone(ZoneId.systemDefault())
            .toLocalDate()
            .atStartOfDay(ZoneId.systemDefault())
            .toInstant()
            .toEpochMilli()
        return enrollmentsForStudent(userId)
            .mapNotNull { enrollment ->
                val meetingId = enrollment.getString("reunionId") ?: return@mapNotNull null
                val meeting = db.collection(MEETINGS).document(meetingId).get().get()
                if (!meeting.exists() || (meeting.getLong("fin") ?: 0L) < todayStart) return@mapNotNull null
                val state = attendanceState(enrollment.getString("estado"), meeting.getLong("fin") ?: 0L, now)
                val dto = meetingDto(meeting, now)
                dto.copy(
                    asistencia = state,
                    ticketDisponible = isTicketWindowOpen(dto.inicio, dto.fin, now) && state == "Pendiente",
                )
            }
            .sortedBy { it.inicio }
    }

    fun scheduleMeeting(token: String, request: ProgramarReunionRequest): ProgramarReunionResponse {
        val (userId, user) = authenticatedUser(token)
        if (!isStaff(user)) throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        require(request.titulo.isNotBlank()) { "Escribe el nombre de la reunión." }
        require(request.ubicacion.isNotBlank()) { "Escribe el salón o aula." }
        require(request.tipo == "CLASE" || request.tipo == "REUNION") { "El tipo de evento no es válido." }
        require(request.fin > request.inicio) { "La hora de fin debe ser posterior a la de inicio." }
        require(request.fin > System.currentTimeMillis()) { "La reunión ya habría terminado." }

        val studentIds = request.estudiantes.distinct()
        require(studentIds.isNotEmpty()) { "Agrega el listado de asistentes esperado." }
        val studentProfiles = studentIds.map { id ->
            val student = getRequiredDocument(STUDENTS, id)
            val studentUserId = student.getString("usuarioId")
                ?: throw IllegalArgumentException("El perfil de estudiante no tiene una cuenta asociada.")
            val programId = student.getString("programaId")
                ?: throw IllegalArgumentException("El perfil de estudiante no tiene un programa asociado.")
            getRequiredDocument(PROGRAMS, programId)
            val studentUser = getRequiredDocument(USERS, studentUserId)
            require(studentUser.getString("rol") == "estudiante") {
                "La persona ${studentUser.getString("nombre") ?: studentUserId} no es estudiante."
            }
            student
        }

        val courseId = if (request.tipo == "CLASE") DEMO_COURSE_ID else null
        val programId = if (courseId != null) {
            val course = getRequiredDocument(COURSES, courseId)
            val linkedProgramId = course.getString("programaId")
                ?: throw IllegalArgumentException("La asignatura no tiene un programa asociado.")
            getRequiredDocument(PROGRAMS, linkedProgramId)
            linkedProgramId
        } else {
            null
        }

        val now = System.currentTimeMillis()
        val meetingRef = db.collection(MEETINGS).document()
        val batch = db.batch()
        batch.set(
            meetingRef,
            mapOf(
                "titulo" to request.titulo.trim(),
                "tipo" to request.tipo,
                "descripcion" to request.descripcion.trim(),
                "ubicacion" to request.ubicacion.trim(),
                "inicio" to request.inicio,
                "fin" to request.fin,
                "docenteId" to userId,
                "asignaturaId" to courseId,
                "programaId" to programId,
            ),
        )
        studentProfiles.forEachIndexed { index, student ->
            val studentId = student.getString("usuarioId")
                ?: throw IllegalArgumentException("El perfil de estudiante no tiene una cuenta asociada.")
            val enrollmentRef = db.collection(ENROLLMENTS)
                .document(enrollmentDocumentId(meetingRef.id, studentId))
            batch.set(
                enrollmentRef,
                enrollmentData(
                    meetingRef.id,
                    studentId,
                    estado = null,
                    registradoEn = null,
                ),
            )
        }
        batch.commit().get()
        val meeting = meetingRef.get().get()
        return ProgramarReunionResponse(meetingDto(meeting, now, attendanceSummary(meetingRef.id, request.fin, now)))
    }

    fun listStudents(token: String): List<EstudianteDto> {
        val (_, user) = authenticatedUser(token)
        if (!isStaff(user)) throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        return db.collection(STUDENTS).get().get().documents.mapNotNull { student ->
            val userId = student.getString("usuarioId") ?: student.id
            val userDoc = db.collection(USERS).document(userId).get().get()
            if (!userDoc.exists() || userDoc.getString("rol") != "estudiante") return@mapNotNull null
            val data = userDoc.dataOrEmpty()
            EstudianteDto(
                id = student.id,
                codigo = data.string("codigo"),
                nombre = data.string("nombre"),
                correo = data.string("correo"),
            )
        }.sortedBy { it.nombre.lowercase() }
    }

    fun report(token: String, meetingId: String): ReporteDto {
        val (userId, user) = authenticatedUser(token)
        if (!isStaff(user)) throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        val meeting = getRequiredDocument(MEETINGS, meetingId)
        authorizeStaffForMeeting(userId, user, meeting.dataOrEmpty())
        val now = System.currentTimeMillis()
        val rows = enrollmentsForMeeting(meetingId).mapNotNull { enrollment ->
            val studentId = enrollment.getString("estudianteId") ?: return@mapNotNull null
            val student = db.collection(USERS).document(studentId).get().get()
            if (!student.exists()) return@mapNotNull null
            val data = student.dataOrEmpty()
            AsistenciaEstudianteDto(
                id = studentId,
                nombre = data.string("nombre"),
                codigo = data.string("codigo"),
                correo = data.string("correo"),
                estado = attendanceState(
                    enrollment.getString("estado"),
                    meeting.getLong("fin") ?: 0L,
                    now,
                ),
                registradoEn = enrollment.getLong("registradoEn"),
            )
        }.sortedBy { it.nombre.lowercase() }
        val counts = summarize(rows)
        return ReporteDto(meetingDto(meeting, now, counts), rows, counts)
    }

    fun ticket(token: String, meetingId: String): TicketResponse {
        val (userId, user) = authenticatedUser(token)
        if (user.string("rol") != "estudiante") throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        val meeting = getRequiredDocument(MEETINGS, meetingId)
        val enrollment = getEnrollment(meetingId, userId)
        val now = System.currentTimeMillis()
        val start = meeting.getLong("inicio") ?: 0L
        val finish = meeting.getLong("fin") ?: 0L
        val state = attendanceState(enrollment.getString("estado"), finish, now)
        val active = isTicketWindowOpen(start, finish, now) && state == "Pendiente"
        return TicketResponse(
            ahora = now,
            pasoMs = QR_STEP_MS,
            reunion = meetingDto(meeting, now),
            ticket = TicketDto(
                id = enrollment.id,
                secreto = if (active) enrollment.getString("secreto") else null,
                asistencia = state,
                registradoEn = enrollment.getLong("registradoEn"),
            ),
        )
    }

    fun scan(token: String, meetingId: String, request: EscanearRequest): EscaneoResponse {
        val (userId, user) = authenticatedUser(token)
        if (!isStaff(user)) throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        val meeting = getRequiredDocument(MEETINGS, meetingId)
        authorizeStaffForMeeting(userId, user, meeting.dataOrEmpty())
        val now = System.currentTimeMillis()
        val finish = meeting.getLong("fin") ?: 0L

        fun response(
            result: String,
            message: String,
            student: EstudianteEscaneoDto? = null,
            state: String? = null,
        ) = attendanceSummary(meetingId, finish, now).let { summary ->
            EscaneoResponse(
                resultado = result,
                mensaje = message,
                estudiante = student,
                estado = state,
                registrados = summary.registrados,
                total = summary.total,
            )
        }

        val qr = Regex("^KC1\\.([A-Za-z0-9_-]+)\\.(\\d+)\\.([0-9a-f]{16})$")
            .matchEntire(request.codigo)
            ?: return response("INVALIDO", "Este QR no es un ticket de KonradCheck.")
        val ticketId = qr.groupValues[1]
        val step = qr.groupValues[2].toLongOrNull()
            ?: return response("INVALIDO", "Este QR no es un ticket de KonradCheck.")
        val enrollment = db.collection(ENROLLMENTS).document(ticketId).get().get()
        if (!enrollment.exists()) return response("INVALIDO", "La firma del código no es válida.")
        val enrollmentData = enrollment.dataOrEmpty()
        val secret = enrollmentData.string("secreto")
        if (!signaturesMatch(signQrStep(secret, ticketId, step), qr.groupValues[3])) {
            return response("INVALIDO", "La firma del código no es válida.")
        }
        val studentId = enrollmentData.string("estudianteId")
        val student = db.collection(USERS).document(studentId).get().get()
        if (!student.exists()) return response("INVALIDO", "La cuenta de este estudiante ya no existe.")
        val studentData = student.dataOrEmpty()
        val studentView = EstudianteEscaneoDto(studentData.string("nombre"), studentData.string("codigo"))

        if (enrollmentData.string("reunionId") != meetingId) {
            return response("OTRA_REUNION", "Este ticket pertenece a otra reunión.", studentView)
        }
        val existingState = enrollmentData.optionalString("estado")
        if (existingState != null) {
            return response(
                "DUPLICADO",
                "Este estudiante ya estaba registrado.",
                studentView,
                existingState,
            )
        }
        if (kotlin.math.abs(now / QR_STEP_MS - step) > QR_TOLERANCE_STEPS) {
            return response(
                "VENCIDO",
                "Código vencido: puede ser una captura. Pide el ticket en vivo desde la app.",
                studentView,
            )
        }
        val start = meeting.getLong("inicio") ?: 0L
        if (!isTicketWindowOpen(start, finish, now)) {
            return response("FUERA_DE_HORARIO", "El registro de esta reunión no está abierto.", studentView)
        }

        val state = if (now - start > LATE_AFTER_MS) "Tardanza" else "Presente"
        val previousState = db.runTransaction { transaction ->
            val latest = transaction.get(enrollment.reference).get()
            if (!latest.exists()) throw NotFoundException("La inscripción ya no existe.")
            val registered = latest.getString("estado")
            if (registered != null) {
                registered
            } else {
                transaction.update(enrollment.reference, mapOf("estado" to state, "registradoEn" to now))
                null
            }
        }.get()
        if (previousState != null) {
            return response(
                "DUPLICADO",
                "Este estudiante ya estaba registrado.",
                studentView,
                previousState,
            )
        }
        return response("REGISTRADO", "Registro exitoso", studentView, state)
    }

    fun history(token: String): List<HistorialDto> {
        val (userId, user) = authenticatedUser(token)
        if (user.string("rol") != "estudiante") throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        val now = System.currentTimeMillis()
        return enrollmentsForStudent(userId).mapNotNull { enrollment ->
            val meetingId = enrollment.getString("reunionId") ?: return@mapNotNull null
            val meeting = db.collection(MEETINGS).document(meetingId).get().get()
            if (!meeting.exists()) return@mapNotNull null
            val finish = meeting.getLong("fin") ?: 0L
            val state = attendanceState(enrollment.getString("estado"), finish, now)
            if (state == "Pendiente") return@mapNotNull null
            HistorialDto(
                id = enrollment.id,
                titulo = meeting.getString("titulo") ?: "",
                tipo = meeting.getString("tipo") ?: "",
                inicio = meeting.getLong("inicio") ?: 0L,
                estado = state,
                registradoEn = enrollment.getLong("registradoEn"),
            )
        }.sortedByDescending { it.inicio }
    }

    fun pendingTickets(token: String, meetingId: String): List<TicketPendienteDto> {
        val (userId, user) = authenticatedUser(token)
        if (!isStaff(user)) throw ForbiddenException("Tu rol no tiene acceso a esta función.")
        val meeting = getRequiredDocument(MEETINGS, meetingId)
        authorizeStaffForMeeting(userId, user, meeting.dataOrEmpty())
        return enrollmentsForMeeting(meetingId).mapNotNull { enrollment ->
            if (enrollment.getString("estado") != null) return@mapNotNull null
            val studentId = enrollment.getString("estudianteId") ?: return@mapNotNull null
            val student = db.collection(USERS).document(studentId).get().get()
            if (!student.exists()) return@mapNotNull null
            val data = student.dataOrEmpty()
            TicketPendienteDto(
                id = enrollment.id,
                secreto = enrollment.getString("secreto") ?: "",
                nombre = data.string("nombre"),
                codigo = data.string("codigo"),
            )
        }.sortedBy { it.nombre.lowercase() }
    }

    private fun seedDemoData() {
        val students = studentsInCsv.map { student ->
            student.copy(id = resolveDemoUserId(student.correo, student.id))
        }
        val staffId = resolveDemoUserId("armando.casas@konradlorenz.edu.co", DEMO_STAFF_ID)
        val now = System.currentTimeMillis()
        val active = currentHourWindow(now)
        val finishedStart = active.inicio - 26 * 60 * 60 * 1000L
        val futureStart = active.inicio + 4 * 60 * 60 * 1000L
        val meetings = listOf(
            MeetingSeed(
                ACTIVE_MEETING_ID,
                "Clase de demostración en curso",
                "CLASE",
                "Clase activa para probar agenda, ticket y escáner.",
                "Salón 402, Edificio Central",
                active.inicio,
                active.fin,
                DEMO_COURSE_ID,
            ),
            MeetingSeed(
                FINISHED_MEETING_ID,
                "Clase de demostración finalizada",
                "CLASE",
                "Sesión cerrada para probar el reporte y el historial.",
                "Aula 103",
                finishedStart,
                finishedStart + 2 * 60 * 60 * 1000L,
                DEMO_COURSE_ID,
            ),
            MeetingSeed(
                FUTURE_MEETING_ID,
                "Reunión informativa de demostración",
                "REUNION",
                "Evento futuro para probar la agenda y el ticket inactivo.",
                "Auditorio Principal",
                futureStart,
                futureStart + 60 * 60 * 1000L,
                null,
            ),
        )
        val userRefs = students.map { db.collection(USERS).document(it.id) } +
            db.collection(USERS).document(staffId)
        val profileRefs = students.map { db.collection(STUDENTS).document(it.id) } +
            db.collection(STAFF).document(staffId)
        val programRef = db.collection(PROGRAMS).document(DEMO_PROGRAM_ID)
        val courseRef = db.collection(COURSES).document(DEMO_COURSE_ID)
        val meetingRefs = meetings.map { db.collection(MEETINGS).document(it.id) }
        val enrollments = meetings.flatMapIndexed { meetingIndex, meeting ->
            students.mapIndexed { studentIndex, student ->
                val state = if (meetingIndex == 1) {
                    when (studentIndex) {
                        1 -> "Tardanza"
                        2 -> null
                        else -> "Presente"
                    }
                } else {
                    null
                }
                val registeredAt = when (state) {
                    "Presente" -> meeting.inicio + 5 * 60 * 1000L
                    "Tardanza" -> meeting.inicio + 22 * 60 * 1000L
                    else -> null
                }
                EnrollmentSeed(
                    enrollmentDocumentId(meeting.id, student.id),
                    meeting.id,
                    student.id,
                    state,
                    registeredAt,
                )
            }
        }
        val enrollmentRefs = enrollments.map { db.collection(ENROLLMENTS).document(it.id) }
        val allRefs = userRefs + profileRefs + programRef + courseRef + meetingRefs + enrollmentRefs

        db.runTransaction { transaction ->
            val existing = allRefs.associate { ref ->
                ref.path to transaction.get(ref).get()
            }
            transaction.set(
                programRef,
                mapOf("nombre" to "Programa de Pregrado", "codigo" to "DEMO"),
                SetOptions.merge(),
            )
            transaction.set(
                courseRef,
                mapOf(
                    "nombre" to "Curso de demostración",
                    "programaId" to DEMO_PROGRAM_ID,
                ),
                SetOptions.merge(),
            )
            students.forEach { student ->
                val account = mutableMapOf<String, Any>(
                    "codigo" to student.codigo,
                    "nombre" to student.nombre,
                    "correo" to student.correo,
                    "rol" to "estudiante",
                    "detalle" to "Estudiante Pregrado",
                )
                if (student.canLogin) {
                    account["passwordHash"] = sha256Hex(DEMO_PASSWORD)
                }
                transaction.set(
                    db.collection(USERS).document(student.id),
                    account,
                    SetOptions.merge(),
                )
                transaction.set(
                    db.collection(STUDENTS).document(student.id),
                    mapOf(
                        "usuarioId" to student.id,
                        "codigo" to student.codigo,
                        "programaId" to DEMO_PROGRAM_ID,
                    ),
                    SetOptions.merge(),
                )
            }
            transaction.set(
                db.collection(USERS).document(staffId),
                mapOf(
                    "codigo" to "D1045",
                    "nombre" to "Dr. Armando Casas",
                    "correo" to "armando.casas@konradlorenz.edu.co",
                    "rol" to "docente",
                    "detalle" to "Facultad de Matemáticas e Ingeniería",
                    "passwordHash" to sha256Hex(DEMO_PASSWORD),
                ),
                SetOptions.merge(),
            )
            transaction.set(
                db.collection(STAFF).document(staffId),
                mapOf(
                    "usuarioId" to staffId,
                    "codigo" to "D1045",
                    "tipo" to "docente",
                    "area" to "Facultad de Matemáticas e Ingeniería",
                ),
                SetOptions.merge(),
            )
            meetings.forEach { item ->
                transaction.set(
                    db.collection(MEETINGS).document(item.id),
                    mapOf(
                        "titulo" to item.titulo,
                        "tipo" to item.tipo,
                        "descripcion" to item.descripcion,
                        "ubicacion" to item.ubicacion,
                        "inicio" to item.inicio,
                        "fin" to item.fin,
                        "docenteId" to staffId,
                        "asignaturaId" to item.cursoId,
                        "programaId" to item.cursoId?.let { DEMO_PROGRAM_ID },
                    ),
                    SetOptions.merge(),
                )
            }
            enrollments.forEach { enrollment ->
                val ref = db.collection(ENROLLMENTS).document(enrollment.id)
                if (existing[ref.path]?.exists() != true) {
                    transaction.set(
                        ref,
                        enrollmentData(
                            enrollment.reunionId,
                            enrollment.estudianteId,
                            enrollment.estado,
                            enrollment.registradoEn,
                        ),
                    )
                }
            }
        }.get()
    }

    private fun resolveDemoUserId(email: String, preferredId: String): String {
        val existing = db.collection(USERS)
            .whereEqualTo("correo", email)
            .limit(1)
            .get()
            .get()
            .documents
            .firstOrNull()
        if (existing != null) return existing.id

        val preferred = db.collection(USERS).document(preferredId).get().get()
        if (!preferred.exists() || preferred.getString("correo") == email) return preferredId
        return "$preferredId-${sha256Hex(email).take(8)}"
    }

    private fun enrollmentData(
        reunionId: String,
        estudianteId: String,
        estado: String?,
        registradoEn: Long?,
    ): Map<String, Any?> = mapOf(
        "reunionId" to reunionId,
        "estudianteId" to estudianteId,
        "secreto" to sha256Hex("konradcheck-demo:$reunionId:$estudianteId").take(32),
        "estado" to estado,
        "registradoEn" to registradoEn,
    )

    private fun authenticatedUser(token: String): Pair<String, Map<String, Any?>> {
        val session = db.collection(SESSIONS).document(token).get().get()
        if (!session.exists()) throw UnauthorizedException("Tu sesión ya no está activa. Inicia sesión de nuevo.")
        val userId = session.getString("usuarioId")
            ?: throw UnauthorizedException("Tu sesión ya no está activa. Inicia sesión de nuevo.")
        val user = db.collection(USERS).document(userId).get().get()
        if (!user.exists()) throw UnauthorizedException("Tu sesión ya no está activa. Inicia sesión de nuevo.")
        return userId to user.dataOrEmpty()
    }

    private fun userDto(id: String, data: Map<String, Any?>): UsuarioDto {
        val role = data.string("rol")
        return UsuarioDto(
            id = id,
            codigo = data.string("codigo"),
            nombre = data.string("nombre"),
            correo = data.string("correo"),
            rol = role,
            area = if (role == "estudiante") "estudiante" else "personal",
            detalle = data.string("detalle"),
        )
    }

    private fun meetingDto(
        meeting: DocumentSnapshot,
        now: Long,
        summary: ResumenAsistenciaDto? = null,
    ): ReunionDto {
        val inicio = meeting.getLong("inicio") ?: 0L
        val fin = meeting.getLong("fin") ?: 0L
        return ReunionDto(
            id = meeting.id,
            titulo = meeting.getString("titulo") ?: "",
            tipo = meeting.getString("tipo") ?: "REUNION",
            descripcion = meeting.getString("descripcion") ?: "",
            ubicacion = meeting.getString("ubicacion") ?: "",
            inicio = inicio,
            fin = fin,
            estado = meetingState(inicio, fin, now),
            ticketDesde = inicio - TICKET_WINDOW_MS,
            escaneoActivo = isTicketWindowOpen(inicio, fin, now),
            registrados = summary?.registrados,
            total = summary?.total,
        )
    }

    private fun attendanceSummary(meetingId: String, finish: Long, now: Long): ResumenAsistenciaDto =
        summarize(
            enrollmentsForMeeting(meetingId).map { enrollment ->
                val state = attendanceState(enrollment.getString("estado"), finish, now)
                AsistenciaEstudianteDto(
                    id = enrollment.getString("estudianteId") ?: enrollment.id,
                    nombre = "",
                    codigo = "",
                    correo = "",
                    estado = state,
                    registradoEn = enrollment.getLong("registradoEn"),
                )
            },
        )

    private fun summarize(students: List<AsistenciaEstudianteDto>): ResumenAsistenciaDto {
        val present = students.count { it.estado == "Presente" }
        val late = students.count { it.estado == "Tardanza" }
        val absent = students.count { it.estado == "Ausente" }
        val pending = students.count { it.estado == "Pendiente" }
        return ResumenAsistenciaDto(
            total = students.size,
            registrados = present + late,
            presentes = present,
            tardanzas = late,
            ausentes = absent,
            pendientes = pending,
        )
    }

    private fun enrollmentsForStudent(studentId: String) = db.collection(ENROLLMENTS)
        .whereEqualTo("estudianteId", studentId)
        .get()
        .get()
        .documents

    private fun enrollmentsForMeeting(meetingId: String) = db.collection(ENROLLMENTS)
        .whereEqualTo("reunionId", meetingId)
        .get()
        .get()
        .documents

    private fun getEnrollment(meetingId: String, studentId: String): DocumentSnapshot {
        val enrollment = db.collection(ENROLLMENTS)
            .document(enrollmentDocumentId(meetingId, studentId))
            .get()
            .get()
        if (!enrollment.exists()) throw NotFoundException("No estás inscrito en esta reunión.")
        return enrollment
    }

    private fun getRequiredDocument(collection: String, id: String): DocumentSnapshot {
        val document = db.collection(collection).document(id).get().get()
        if (!document.exists()) throw NotFoundException("No se encontró el registro solicitado.")
        return document
    }

    private fun authorizeStaffForMeeting(
        userId: String,
        user: Map<String, Any?>,
        meeting: Map<String, Any?>,
    ) {
        if (user.string("rol") != "administrativo" && meeting.string("docenteId") != userId) {
            throw ForbiddenException("Esta reunión no está a tu cargo.")
        }
    }

    private fun isStaff(user: Map<String, Any?>): Boolean =
        user.string("rol") == "docente" || user.string("rol") == "administrativo"

    private fun meetingOrder(state: String): Int = when (state) {
        "EN_CURSO" -> 0
        "PROGRAMADA" -> 1
        else -> 2
    }

    private fun DocumentSnapshot.dataOrEmpty(): Map<String, Any?> = data ?: emptyMap()

    private fun Map<String, Any?>.string(key: String): String = this[key] as? String ?: ""

    private fun Map<String, Any?>.optionalString(key: String): String? = this[key] as? String

}
