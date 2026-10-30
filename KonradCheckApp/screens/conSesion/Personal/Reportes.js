import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatosEnVivo } from '../../../hooks/useDatosEnVivo';
import { compartirTexto } from '../../../services/archivos';
import { generarCsv } from '../../../services/csv';
import { formatearDia, formatearHora, formatearRango, fechaParaFormulario } from '../../../services/fechas';
import { obtenerReporte } from '../../../services/reunionesService';
import EstadoPill from '../../components/EstadoPill';

function nombreDeArchivo(reunion) {
    const base = reunion.titulo
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_');
    return `asistencia_${base}_${fechaParaFormulario(reunion.inicio).replace(/\//g, '-')}.csv`;
}

export default function Reportes({ navigation, route }) {
    const reunionId = route.params?.reunionId;
    const [busqueda, setBusqueda] = useState('');
    const [avisoExportacion, setAvisoExportacion] = useState(null);
    const { datos, error, cargando } = useDatosEnVivo(() => obtenerReporte(reunionId), {
        intervalo: 4000,
        clave: reunionId,
        habilitado: !!reunionId,
    });

    const reunion = datos?.reunion;
    const resumen = datos?.resumen;
    const termino = busqueda.trim().toLowerCase();
    const estudiantes = (datos?.estudiantes ?? []).filter(
        (estudiante) => estudiante.nombre.toLowerCase().includes(termino) || estudiante.codigo.includes(termino),
    );

    const exportar = async () => {
        setAvisoExportacion(null);
        try {
            const csv = generarCsv(
                ['Código', 'Nombre', 'Correo', 'Estado', 'Hora de registro'],
                datos.estudiantes.map((estudiante) => [
                    estudiante.codigo,
                    estudiante.nombre,
                    estudiante.correo,
                    estudiante.estado,
                    estudiante.registradoEn ? formatearHora(estudiante.registradoEn) : '',
                ]),
            );
            await compartirTexto(nombreDeArchivo(reunion), csv);
            setAvisoExportacion('Reporte exportado.');
        } catch {
            setAvisoExportacion('No se pudo exportar el reporte.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Volver a reuniones"
                    onPress={() => navigation.navigate('ReunionesPersonal')}
                    hitSlop={10}
                    style={styles.volver}
                >
                    <Text style={styles.volverTexto}>‹ Reuniones</Text>
                </Pressable>

                <Text style={styles.eyebrow}>REPORTE DE ASISTENCIA</Text>

                {cargando && <ActivityIndicator color="#12A889" style={styles.estadoLista} />}
                {error && !datos && <Text style={styles.errorTexto}>{error}</Text>}
                {!reunionId && <Text style={styles.vacio}>Elige una reunión desde tu agenda.</Text>}

                {reunion && (
                    <>
                        <Text style={styles.title}>{reunion.titulo}</Text>
                        <Text style={styles.date}>
                            {formatearDia(reunion.inicio)} · {formatearRango(reunion.inicio, reunion.fin)}
                        </Text>
                        <Text style={styles.date}>{reunion.ubicacion}</Text>

                        <View style={styles.summaryRow}>
                            <Summary value={resumen.presentes} label="Presentes" color="#DFF7E6" />
                            <Summary value={resumen.tardanzas} label="Tarde" color="#FBEFD1" />
                            {reunion.estado === 'FINALIZADA' ? (
                                <Summary value={resumen.ausentes} label="Ausentes" color="#FBE1DE" />
                            ) : (
                                <Summary value={resumen.pendientes} label="Pendientes" color="#EEF1F5" />
                            )}
                        </View>

                        {reunion.escaneoActivo && (
                            <Pressable
                                onPress={() => navigation.navigate('EscanearQR', { reunionId: reunion.id })}
                                style={styles.scanButton}
                            >
                                <Text style={styles.scanButtonText}>Abrir escáner de esta sesión</Text>
                            </Pressable>
                        )}

                        <TextInput
                            style={styles.search}
                            placeholder="Buscar estudiante por nombre o ID..."
                            placeholderTextColor="#9AA8BA"
                            value={busqueda}
                            onChangeText={setBusqueda}
                        />

                        {estudiantes.length === 0 && (
                            <Text style={styles.vacio}>Ningún estudiante coincide con la búsqueda.</Text>
                        )}

                        {estudiantes.map((estudiante) => (
                            <View key={estudiante.id} style={styles.studentRow}>
                                <View style={styles.studentText}>
                                    <Text style={styles.studentName}>{estudiante.nombre}</Text>
                                    <Text style={styles.studentCode}>
                                        Código: {estudiante.codigo}
                                        {estudiante.registradoEn ? ` · ${formatearHora(estudiante.registradoEn)}` : ''}
                                    </Text>
                                </View>
                                <EstadoPill estado={estudiante.estado} />
                            </View>
                        ))}

                        <Pressable style={styles.exportButton} onPress={exportar}>
                            <Text style={styles.exportText}>Exportar Reporte (CSV)</Text>
                        </Pressable>
                        {avisoExportacion && <Text style={styles.aviso}>{avisoExportacion}</Text>}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function Summary({ value, label, color }) {
    return (
        <View style={[styles.summary, { backgroundColor: color }]}>
            <Text style={styles.summaryValue}>{value}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#F4F7FB', flex: 1 },
    container: { padding: 20 },
    volver: { alignSelf: 'flex-start', marginBottom: 10 },
    volverTexto: { color: '#667085', fontSize: 15, fontWeight: '700' },
    eyebrow: { color: '#12A889', fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 },
    title: { color: '#172B4D', fontSize: 22, fontWeight: '800', marginTop: 8 },
    date: { color: '#667085', fontSize: 13, marginTop: 4 },
    summaryRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
    summary: { alignItems: 'center', borderRadius: 12, flex: 1, padding: 12 },
    summaryValue: { color: '#172B4D', fontSize: 20, fontWeight: '800' },
    summaryLabel: { color: '#344054', fontSize: 12, marginTop: 3 },
    scanButton: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 10, marginTop: 14, paddingVertical: 13 },
    scanButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    search: { backgroundColor: '#FFFFFF', borderColor: '#D0D5DD', borderRadius: 10, borderWidth: 1, color: '#172B4D', fontSize: 16, marginTop: 16, marginBottom: 2, padding: 12 },
    studentRow: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', marginTop: 9, padding: 14 },
    studentText: { flex: 1, paddingRight: 10 },
    studentName: { color: '#172B4D', fontSize: 14, fontWeight: '800' },
    studentCode: { color: '#667085', fontSize: 12, marginTop: 3 },
    exportButton: { alignItems: 'center', backgroundColor: '#D7F8F0', borderRadius: 10, marginTop: 22, padding: 15 },
    exportText: { color: '#087C71', fontSize: 14, fontWeight: '700' },
    aviso: { color: '#667085', fontSize: 12, marginTop: 8, textAlign: 'center' },
    estadoLista: { marginVertical: 20 },
    errorTexto: { color: '#C0392B', fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: 'center' },
    vacio: { color: '#667085', fontSize: 14, marginTop: 16, textAlign: 'center' },
});
