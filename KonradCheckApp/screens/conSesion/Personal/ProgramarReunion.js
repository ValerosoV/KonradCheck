import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatosEnVivo } from '../../../hooks/useDatosEnVivo';
import { leerArchivoElegido } from '../../../services/archivos';
import { leerAsistentesDeCsv } from '../../../services/csv';
import {
    construirFecha,
    fechaParaFormulario,
    formatearHora,
    mascaraFecha,
    mascaraHora,
} from '../../../services/fechas';
import { listarEstudiantes, programarReunion } from '../../../services/reunionesService';

const HORA_MS = 60 * 60 * 1000;
const TIPOS_CSV = ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain'];

function formularioInicial() {
    const siguienteHora = Math.ceil(Date.now() / HORA_MS) * HORA_MS;
    return {
        titulo: '',
        tipo: 'CLASE',
        ubicacion: '',
        descripcion: '',
        fecha: fechaParaFormulario(siguienteHora),
        horaInicio: formatearHora(siguienteHora),
        horaFin: formatearHora(siguienteHora + 2 * HORA_MS),
    };
}

export default function ProgramarReunion({ navigation }) {
    const [formulario, setFormulario] = useState(formularioInicial);
    const [asistentes, setAsistentes] = useState([]);
    const [origenLista, setOrigenLista] = useState(null);
    const [noEncontrados, setNoEncontrados] = useState(0);
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const { datos: estudiantes } = useDatosEnVivo(listarEstudiantes);

    const actualizar = (campo) => (valor) => {
        setFormulario((previo) => ({ ...previo, [campo]: valor }));
    };

    const cargarCsv = async () => {
        setError(null);
        try {
            const resultado = await DocumentPicker.getDocumentAsync({ type: TIPOS_CSV });
            if (resultado.canceled) return;

            const archivo = resultado.assets[0];
            const filas = leerAsistentesDeCsv(await leerArchivoElegido(archivo));
            if (filas.length === 0) {
                setError('El archivo no tiene filas con ID o correo. Revisa la plantilla.');
                return;
            }
            const directorio = estudiantes ?? [];
            const coincidencias = filas
                .map((fila) => directorio.find(
                    (estudiante) => estudiante.codigo === fila.codigo || estudiante.correo === fila.correo,
                ))
                .filter(Boolean);
            setAsistentes([...new Set(coincidencias)]);
            setNoEncontrados(filas.length - coincidencias.length);
            setOrigenLista(archivo.name);
        } catch {
            setError('No se pudo leer el archivo. Asegúrate de que sea un .csv.');
        }
    };

    const usarListaDemo = () => {
        setAsistentes(estudiantes ?? []);
        setNoEncontrados(0);
        setOrigenLista('Lista de demostración');
        setError(null);
    };

    const crear = async () => {
        const inicio = construirFecha(formulario.fecha, formulario.horaInicio);
        const fin = construirFecha(formulario.fecha, formulario.horaFin);
        if (!formulario.titulo.trim()) {
            setError('Escribe el nombre de la reunión.');
            return;
        }
        if (!formulario.ubicacion.trim()) {
            setError('Escribe el salón o aula.');
            return;
        }
        if (inicio === null || fin === null) {
            setError('Revisa la fecha (DD/MM/AAAA) y las horas (HH:MM).');
            return;
        }
        if (fin <= inicio) {
            setError('La hora de fin debe ser posterior a la de inicio.');
            return;
        }
        if (asistentes.length === 0) {
            setError('Agrega el listado de asistentes esperado.');
            return;
        }

        setError(null);
        setEnviando(true);
        try {
            const titulo = formulario.titulo.trim();
            await programarReunion({
                titulo,
                tipo: formulario.tipo,
                ubicacion: formulario.ubicacion,
                descripcion: formulario.descripcion,
                inicio,
                fin,
                estudiantes: asistentes.map((estudiante) => estudiante.id),
            });
            // La pantalla sigue montada entre pestanas: queda limpia para la siguiente.
            setFormulario(formularioInicial());
            setAsistentes([]);
            setOrigenLista(null);
            setNoEncontrados(0);
            navigation.navigate('ReunionesPersonal', { creada: titulo });
        } catch (e) {
            setError(e.message);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Volver a reuniones"
                        onPress={() => navigation.navigate('ReunionesPersonal')}
                        style={styles.backButton}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                        <Text style={styles.backText}>Programar reunión</Text>
                    </Pressable>

                    <View style={styles.form}>
                        <Text style={styles.label}>Nombre de la Reunión</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Sistemas Operativos (Parcial)"
                            placeholderTextColor="#9AA8BA"
                            value={formulario.titulo}
                            onChangeText={actualizar('titulo')}
                        />

                        <Text style={styles.label}>Tipo de Evento</Text>
                        <View style={styles.segmentedControl}>
                            <Segmento
                                activo={formulario.tipo === 'CLASE'}
                                onPress={() => actualizar('tipo')('CLASE')}
                                texto="Clase Regular"
                            />
                            <Segmento
                                activo={formulario.tipo === 'REUNION'}
                                onPress={() => actualizar('tipo')('REUNION')}
                                texto="Conferencia / Reunión"
                            />
                        </View>

                        <Text style={styles.label}>Salón / Aula de Clase</Text>
                        <View style={styles.inputWithIcon}>
                            <Text style={styles.fieldIcon}>⌖</Text>
                            <TextInput
                                style={styles.inlineInput}
                                placeholder="Ej: Aula 402, Central"
                                placeholderTextColor="#9AA8BA"
                                value={formulario.ubicacion}
                                onChangeText={actualizar('ubicacion')}
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
                            value={formulario.descripcion}
                            onChangeText={actualizar('descripcion')}
                        />

                        <Text style={styles.label}>Fecha y hora</Text>
                        <FieldBox
                            label="Fecha"
                            value={formulario.fecha}
                            placeholder="DD/MM/AAAA"
                            onChangeText={(texto) => actualizar('fecha')(mascaraFecha(texto))}
                        />
                        <View style={styles.dateRow}>
                            <FieldBox
                                label="Hora de Inicio"
                                value={formulario.horaInicio}
                                placeholder="09:00"
                                onChangeText={(texto) => actualizar('horaInicio')(mascaraHora(texto))}
                            />
                            <FieldBox
                                label="Hora de Fin"
                                value={formulario.horaFin}
                                placeholder="11:00"
                                onChangeText={(texto) => actualizar('horaFin')(mascaraHora(texto))}
                            />
                        </View>

                        <Text style={styles.label}>Listado de Asistencia Esperado</Text>
                        <Pressable style={styles.uploadBox} onPress={cargarCsv}>
                            <Text style={styles.uploadIcon}>↑</Text>
                            <Text style={styles.uploadTitle}>Cargar plantilla excel (.csv)</Text>
                            <Text style={styles.uploadSubtitle}>Formato: ID, Nombre, Email</Text>
                        </Pressable>
                        <Pressable onPress={usarListaDemo} style={styles.demoLink} hitSlop={8}>
                            <Text style={styles.demoLinkText}>
                                Usar lista de demostración ({estudiantes?.length ?? 0} estudiantes)
                            </Text>
                        </Pressable>

                        {origenLista && (
                            <View style={styles.listaResumen}>
                                <Text style={styles.listaTitulo}>
                                    {asistentes.length} estudiantes · {origenLista}
                                </Text>
                                {noEncontrados > 0 && (
                                    <Text style={styles.listaAviso}>
                                        {noEncontrados} filas no coinciden con ninguna cuenta y no se incluirán.
                                    </Text>
                                )}
                            </View>
                        )}

                        {error && <Text style={styles.error}>{error}</Text>}

                        <Pressable style={styles.button} onPress={crear} disabled={enviando}>
                            {enviando ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Crear reunión</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Segmento({ activo, onPress, texto }) {
    return (
        <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: activo }}
            onPress={onPress}
            style={[styles.segment, activo && styles.activeSegment]}
        >
            <Text style={activo ? styles.activeSegmentText : styles.segmentText}>{texto}</Text>
        </Pressable>
    );
}

function FieldBox({ label, value, placeholder, onChangeText }) {
    return (
        <View style={styles.fieldBox}>
            <Text style={styles.fieldBoxLabel}>{label}</Text>
            <TextInput
                style={styles.fieldBoxInput}
                keyboardType="number-pad"
                placeholder={placeholder}
                placeholderTextColor="#9AA8BA"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    flex: { flex: 1 },
    container: { paddingBottom: 24, paddingHorizontal: 20, paddingTop: 12 },
    backButton: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', marginBottom: 16 },
    backIcon: { color: '#172B4D', fontSize: 30, lineHeight: 30, marginRight: 8 },
    backText: { color: '#172B4D', fontSize: 18, fontWeight: '800' },
    form: { gap: 8 },
    label: { color: '#172B4D', fontSize: 13, fontWeight: '800', marginTop: 6 },
    input: { backgroundColor: '#FFFFFF', borderRadius: 10, color: '#172B4D', fontSize: 16, minHeight: 46, paddingHorizontal: 12 },
    segmentedControl: { flexDirection: 'row', gap: 8 },
    segment: { alignItems: 'center', borderColor: '#D0D5DD', borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 42, paddingHorizontal: 6 },
    activeSegment: { backgroundColor: '#D7F8F0', borderColor: '#12A889' },
    activeSegmentText: { color: '#087C71', fontSize: 13, fontWeight: '800', textAlign: 'center' },
    segmentText: { color: '#344054', fontSize: 13, fontWeight: '600', textAlign: 'center' },
    inputWithIcon: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, flexDirection: 'row', minHeight: 46, paddingHorizontal: 12 },
    fieldIcon: { color: '#718096', fontSize: 16, marginRight: 8 },
    inlineInput: { color: '#172B4D', flex: 1, fontSize: 16, minHeight: 46, minWidth: 0, padding: 0 },
    descriptionInput: { backgroundColor: '#FFFFFF', borderRadius: 10, color: '#172B4D', fontSize: 16, minHeight: 78, padding: 12 },
    dateRow: { flexDirection: 'row', gap: 8 },
    fieldBox: { flex: 1 },
    fieldBoxLabel: { color: '#344054', fontSize: 12, fontWeight: '700', marginBottom: 5 },
    fieldBoxInput: { backgroundColor: '#FFFFFF', borderRadius: 10, color: '#172B4D', fontSize: 16, minHeight: 46, minWidth: 0, paddingHorizontal: 12, width: '100%' },
    uploadBox: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#12A889', borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, justifyContent: 'center', minHeight: 84, padding: 10 },
    uploadIcon: { color: '#12A889', fontSize: 22, fontWeight: '800', lineHeight: 24 },
    uploadTitle: { color: '#087C71', fontSize: 13, fontWeight: '800', marginTop: 2 },
    uploadSubtitle: { color: '#667085', fontSize: 12, marginTop: 3 },
    demoLink: { alignItems: 'center', paddingVertical: 4 },
    demoLinkText: { color: '#07877B', fontSize: 13, fontWeight: '700' },
    listaResumen: { backgroundColor: '#D7F8F0', borderRadius: 10, padding: 12 },
    listaTitulo: { color: '#087C71', fontSize: 13, fontWeight: '800' },
    listaAviso: { color: '#B07A1E', fontSize: 12, fontWeight: '600', lineHeight: 17, marginTop: 4 },
    error: { color: '#C0392B', fontSize: 13, fontWeight: '600', lineHeight: 18 },
    button: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 10, marginTop: 8, minHeight: 48, justifyContent: 'center' },
    buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
