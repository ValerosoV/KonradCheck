package com.konradcheck.config

import com.google.auth.oauth2.ServiceAccountCredentials
import com.google.cloud.firestore.Firestore
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import java.io.File

object FirebaseConfig {
    fun firestore(): Firestore {
        if (FirebaseApp.getApps().isEmpty()) {
            val credentialFile = File(
                System.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") ?: "serviceAccountKey.json",
            )
            require(credentialFile.isFile) {
                "No se encontró la cuenta de servicio en ${credentialFile.path}. " +
                    "Copia el JSON local en esa ruta o define FIREBASE_SERVICE_ACCOUNT_PATH."
            }

            credentialFile.inputStream().use { input ->
                val credentials = ServiceAccountCredentials.fromStream(input)
                val projectId = credentials.projectId
                require(!projectId.isNullOrBlank()) {
                    "La cuenta de servicio no contiene el identificador del proyecto Firebase."
                }
                val options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .setProjectId(projectId)
                    .build()
                FirebaseApp.initializeApp(options)
            }
        }
        return FirestoreClient.getFirestore()
    }
}
