package com.konradcheck.domain

import java.time.ZoneId
import java.time.ZonedDateTime
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class AttendanceRulesTest {
    @Test
    fun `current hour meeting covers this hour and the next`() {
        val zone = ZoneId.of("America/Bogota")
        val current = ZonedDateTime.of(2026, 11, 19, 13, 59, 0, 0, zone)
        val window = currentHourWindow(current.toInstant().toEpochMilli(), zone)

        assertEquals(current.withMinute(0).withSecond(0).withNano(0).toInstant().toEpochMilli(), window.inicio)
        assertEquals(current.withMinute(0).withSecond(0).withNano(0).plusHours(2).toInstant().toEpochMilli(), window.fin)
    }

    @Test
    fun `ticket window opens before meeting and closes at its end`() {
        val start = 10_000_000L
        val finish = start + 2 * 60 * 60 * 1000L

        assertTrue(isTicketWindowOpen(start, finish, start - TICKET_WINDOW_MS))
        assertTrue(isTicketWindowOpen(start, finish, finish))
        assertFalse(isTicketWindowOpen(start, finish, finish + 1))
    }

    @Test
    fun `enrollment identity is deterministic and attendance is derived after meeting ends`() {
        val first = enrollmentDocumentId("reunion_a", "estudiante_b")
        assertEquals(first, enrollmentDocumentId("reunion_a", "estudiante_b"))
        assertTrue(first.matches(Regex("ticket_[0-9a-f]{32}")))
        assertEquals("Ausente", attendanceState(null, 5_000L, 5_001L))
        assertEquals("Tardanza", attendanceState("Tardanza", 5_000L, 5_001L))
    }
}
