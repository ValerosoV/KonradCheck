package com.konradcheck.domain

import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

const val QR_STEP_MS = 5_000L
const val QR_TOLERANCE_STEPS = 1L
const val TICKET_WINDOW_MS = 15 * 60 * 1000L
const val LATE_AFTER_MS = 15 * 60 * 1000L

data class TimeWindow(val inicio: Long, val fin: Long)

fun currentHourWindow(now: Long, zone: ZoneId = ZoneId.systemDefault()): TimeWindow {
    val start = ZonedDateTime.ofInstant(Instant.ofEpochMilli(now), zone)
        .withMinute(0)
        .withSecond(0)
        .withNano(0)
    return TimeWindow(start.toInstant().toEpochMilli(), start.plusHours(2).toInstant().toEpochMilli())
}

fun enrollmentDocumentId(reunionId: String, estudianteId: String): String =
    "ticket_${sha256Hex("$reunionId|$estudianteId").take(32)}"

fun meetingState(inicio: Long, fin: Long, now: Long): String = when {
    now < inicio -> "PROGRAMADA"
    now <= fin -> "EN_CURSO"
    else -> "FINALIZADA"
}

fun attendanceState(estado: String?, fin: Long, now: Long): String =
    estado ?: if (now > fin) "Ausente" else "Pendiente"

fun isTicketWindowOpen(inicio: Long, fin: Long, now: Long): Boolean =
    now >= inicio - TICKET_WINDOW_MS && now <= fin

fun sha256Hex(value: String): String =
    MessageDigest.getInstance("SHA-256")
        .digest(value.toByteArray(StandardCharsets.UTF_8))
        .joinToString("") { "%02x".format(it) }

fun signQrStep(secret: String, ticketId: String, step: Long): String {
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256"))
    return mac.doFinal("$ticketId.$step".toByteArray(StandardCharsets.UTF_8))
        .take(8)
        .joinToString("") { "%02x".format(it) }
}

fun signaturesMatch(expected: String, provided: String): Boolean =
    MessageDigest.isEqual(
        expected.toByteArray(StandardCharsets.US_ASCII),
        provided.toByteArray(StandardCharsets.US_ASCII),
    )
