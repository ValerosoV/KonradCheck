package com.konradcheck.security

import com.konradcheck.domain.sha256Hex
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class PasswordHasherTest {
    @Test
    fun `hashes new passwords with unique salts and verifies them`() {
        val first = PasswordHasher.hash("nueva-clave-segura")
        val second = PasswordHasher.hash("nueva-clave-segura")

        assertNotEquals(first, second)
        assertTrue(PasswordHasher.verify("nueva-clave-segura", first))
        assertFalse(PasswordHasher.verify("otra-clave", first))
        assertFalse(PasswordHasher.needsUpgrade(first))
    }

    @Test
    fun `accepts legacy hashes so successful logins can upgrade them`() {
        val legacyHash = sha256Hex("Konrad123")

        assertTrue(PasswordHasher.verify("Konrad123", legacyHash))
        assertTrue(PasswordHasher.needsUpgrade(legacyHash))
    }
}
