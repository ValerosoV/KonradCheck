package com.konradcheck.services

interface PasswordResetEmailSender {
    fun validateConfiguration()

    fun sendCode(recipient: String, code: String)
}

class PasswordResetDeliveryException(
    message: String,
    cause: Throwable? = null,
) : RuntimeException(message, cause)
