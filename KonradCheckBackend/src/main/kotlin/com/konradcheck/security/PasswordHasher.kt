package com.konradcheck.security

import com.konradcheck.domain.sha256Hex
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

object PasswordHasher {
    private const val FORMAT = "pbkdf2-sha256"
    private const val CURRENT_ITERATIONS = 210_000
    private const val MIN_ITERATIONS = 10_000
    private const val MAX_ITERATIONS = 1_000_000
    private const val SALT_BYTES = 16
    private const val HASH_BITS = 256
    private val random = SecureRandom()

    fun hash(value: String): String {
        require(value.length <= 1024) { "El valor es demasiado largo." }
        val salt = ByteArray(SALT_BYTES).also(random::nextBytes)
        val derived = derive(value, salt, CURRENT_ITERATIONS)
        return listOf(
            FORMAT,
            CURRENT_ITERATIONS.toString(),
            Base64.getEncoder().encodeToString(salt),
            Base64.getEncoder().encodeToString(derived),
        ).joinToString("$")
    }

    fun verify(value: String, encoded: String): Boolean {
        if (value.length > 1024) return false
        val parsed = parse(encoded)
        if (parsed == null) {
            val legacy = sha256Hex(value).toByteArray(Charsets.US_ASCII)
            return MessageDigest.isEqual(legacy, encoded.toByteArray(Charsets.US_ASCII))
        }
        val actual = derive(value, parsed.salt, parsed.iterations)
        return MessageDigest.isEqual(parsed.hash, actual)
    }

    fun needsUpgrade(encoded: String): Boolean {
        val parsed = parse(encoded) ?: return true
        return parsed.iterations < CURRENT_ITERATIONS
    }

    private fun parse(encoded: String): EncodedHash? {
        val parts = encoded.split('$')
        if (parts.size != 4 || parts[0] != FORMAT) return null
        val iterations = parts[1].toIntOrNull() ?: return null
        if (iterations !in MIN_ITERATIONS..MAX_ITERATIONS) return null
        return try {
            val salt = Base64.getDecoder().decode(parts[2])
            val hash = Base64.getDecoder().decode(parts[3])
            if (salt.size != SALT_BYTES || hash.size != HASH_BITS / 8) return null
            EncodedHash(iterations, salt, hash)
        } catch (_: IllegalArgumentException) {
            null
        }
    }

    private fun derive(value: String, salt: ByteArray, iterations: Int): ByteArray {
        val spec = PBEKeySpec(value.toCharArray(), salt, iterations, HASH_BITS)
        return try {
            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                .generateSecret(spec)
                .encoded
        } finally {
            spec.clearPassword()
        }
    }

    private data class EncodedHash(val iterations: Int, val salt: ByteArray, val hash: ByteArray)
}
