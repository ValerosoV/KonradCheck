import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function ProgramarReunion({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>‹</Text>
                    <Text style={styles.backText}>Programar reunión</Text>
                </Pressable>

                <View style={styles.form}>
                    <Text style={styles.label}>Nombre de la Reunión</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Sistemas Operativos (Parcial)"
                        placeholderTextColor="#9AA8BA"
                    />

                    <Text style={styles.label}>Tipo de Evento</Text>
                    <View style={styles.segmentedControl}>
                        <Pressable style={[styles.segment, styles.activeSegment]}>
                            <Text style={styles.activeSegmentText}>Clase Regular</Text>
                        </Pressable>
                        <Pressable style={styles.segment}>
                            <Text style={styles.segmentText}>Conferencia / Reunión</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.label}>Salón / Aula de Clase</Text>
                    <View style={styles.inputWithIcon}>
                        <Text style={styles.fieldIcon}>⌖</Text>
                        <TextInput
                            style={styles.inlineInput}
                            placeholder="Ej: Aula 402, Central"
                            placeholderTextColor="#9AA8BA"
                        />
                    </View>

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        multiline
                        numberOfLines={3}
                        style={styles.descriptionInput}
                        placeholder="Ej: Objetivos, materiales y observaciones para la sesión."
                        placeholderTextColor="#9AA8BA"
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Fecha y hora</Text>
                    <View style={styles.dateRow}>
                        <FieldBox label="Fecha" value="12/11/2025" icon="▣" />
                        <FieldBox label="Hora de Inicio" value="09:00" icon="◷" />
                        <FieldBox label="Hora de Fin" value="11:00" icon="◷" />
                    </View>

                    <Text style={styles.label}>Listado de Asistencia Esperado</Text>
                    <Pressable style={styles.uploadBox}>
                        <Text style={styles.uploadIcon}>↑</Text>
                        <Text style={styles.uploadTitle}>Cargar plantilla excel (.csv)</Text>
                        <Text style={styles.uploadSubtitle}>Formato: ID, Nombre, Email, Estado</Text>
                    </Pressable>

                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Crear Evento de Firma</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function FieldBox({ label, value, icon }) {
    return (
        <View style={styles.fieldBox}>
            <Text style={styles.fieldBoxLabel}>{label}</Text>
            <View style={styles.fieldBoxInput}>
                <Text style={styles.smallIcon}>{icon}</Text>
                <Text style={styles.fieldBoxValue}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    container: { paddingBottom: 24, paddingHorizontal: 18, paddingTop: 10 },
    backButton: { alignItems: 'center', flexDirection: 'row', marginBottom: 18 },
    backIcon: { color: '#172B4D', fontSize: 28, lineHeight: 26, marginRight: 7 },
    backText: { color: '#172B4D', fontSize: 14, fontWeight: '800' },
    form: { gap: 8 },
    label: { color: '#172B4D', fontSize: 9, fontWeight: '800', marginTop: 4 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 7, color: '#172B4D', fontSize: 10, minHeight: 36, paddingHorizontal: 11 },
    segmentedControl: { flexDirection: 'row', gap: 6 },
    segment: { alignItems: 'center', borderColor: '#D0D5DD', borderRadius: 6, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 30, paddingHorizontal: 4 },
    activeSegment: { backgroundColor: '#D7F8F0', borderColor: '#12A889' },
    activeSegmentText: { color: '#087C71', fontSize: 8, fontWeight: '800' },
    segmentText: { color: '#344054', fontSize: 8, fontWeight: '600' },
    inputWithIcon: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 7, flexDirection: 'row', minHeight: 36, paddingHorizontal: 10 },
    fieldIcon: { color: '#718096', fontSize: 14, marginRight: 7 },
    inlineInput: { color: '#172B4D', flex: 1, fontSize: 10, minHeight: 36, padding: 0 },
    descriptionInput: { backgroundColor: '#FFFFFF', borderRadius: 7, color: '#172B4D', fontSize: 10, minHeight: 60, padding: 11 },
    dateRow: { flexDirection: 'row', gap: 7 },
    fieldBox: { flex: 1 },
    fieldBoxLabel: { color: '#344054', fontSize: 8, fontWeight: '700', marginBottom: 4 },
    fieldBoxInput: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 7, flexDirection: 'row', minHeight: 36, paddingHorizontal: 7 },
    smallIcon: { color: '#718096', fontSize: 11, marginRight: 5 },
    fieldBoxValue: { color: '#718096', flex: 1, fontSize: 8 },
    uploadBox: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#12A889', borderRadius: 7, borderStyle: 'dashed', borderWidth: 1, justifyContent: 'center', minHeight: 66, padding: 8 },
    uploadIcon: { color: '#12A889', fontSize: 22, fontWeight: '800', lineHeight: 22 },
    uploadTitle: { color: '#087C71', fontSize: 8, fontWeight: '800', marginTop: 2 },
    uploadSubtitle: { color: '#9AA8BA', fontSize: 7, marginTop: 3 },
    button: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 7, marginTop: 8, minHeight: 38, justifyContent: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
});
