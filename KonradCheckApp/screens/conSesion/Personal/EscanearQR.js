import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    Vibration,
    View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatosEnVivo } from '../../../hooks/useDatosEnVivo';
import { escanearCodigo, obtenerCodigosDemo } from '../../../services/asistenciaService';
import { formatearHora } from '../../../services/fechas';
import { listarReuniones, obtenerReporte } from '../../../services/reunionesService';

const ALTO_ESCANER = 240;
const MS_IGNORAR_MISMO_TICKET = 6000; // El celular sigue frente a la camara tras registrarse.
const ULTIMOS_REGISTROS = 4;

const ESTILO_RESULTADO = {
    REGISTRADO: { fondo: '#C9F6EA', circulo: '#12A889', simbolo: '✓', titulo: '#087C71' },
    DUPLICADO: { fondo: '#FBEFD1', circulo: '#B07A1E', simbolo: '!', titulo: '#8A5F14' },
    RECHAZADO: { fondo: '#FBE1DE', circulo: '#C0392B', simbolo: '✕', titulo: '#A93226' },
};

function LineaDeEscaneo() {
    const avance = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animacion = Animated.loop(
            Animated.sequence([
                Animated.timing(avance, {
                    toValue: 1,
                    duration: 1600,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(avance, {
                    toValue: 0,
                    duration: 1600,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]),
        );
        animacion.start();
        return () => animacion.stop();
    }, [avance]);

    return (
        <Animated.View
            style={[
                styles.scanLine,
                {
                    transform: [
                        { translateY: avance.interpolate({ inputRange: [0, 1], outputRange: [12, ALTO_ESCANER - 16] }) },
                    ],
                },
            ]}
        />
    );
}

function TarjetaResultado({ resultado }) {
    const tipo = ESTILO_RESULTADO[resultado.resultado] ? resultado.resultado : 'RECHAZADO';
    const estilo = ESTILO_RESULTADO[tipo];
    return (
        <View style={[styles.resultCard, { backgroundColor: estilo.fondo }]}>
            <View style={[styles.checkCircle, { backgroundColor: estilo.circulo }]}>
                <Text style={styles.checkText}>{estilo.simbolo}</Text>
            </View>
            <View style={styles.resultCopy}>
                <Text style={[styles.resultEyebrow, { color: estilo.titulo }]}>
                    {resultado.mensaje}
                    {resultado.estado ? ` · ${resultado.estado}` : ''}
                </Text>
                {resultado.estudiante && (
                    <>
                        <Text style={styles.studentName}>{resultado.estudiante.nombre}</Text>
                        <Text style={styles.studentCode}>Código: {resultado.estudiante.codigo}</Text>
                    </>
                )}
            </View>
        </View>
    );
}

function Camara({ onCodigo }) {
    const [permiso, pedirPermiso] = useCameraPermissions();
    const [frontal, setFrontal] = useState(false);
    const [errorCamara, setErrorCamara] = useState(null);

    if (!permiso) {
        return (
            <View style={styles.cameraPlaceholder}>
                <ActivityIndicator color="#12A889" />
            </View>
        );
    }
    if (!permiso.granted) {
        return (
            <View style={styles.cameraPlaceholder}>
                <Text style={styles.placeholderText}>
                    {permiso.canAskAgain
                        ? 'Autoriza la cámara para leer los tickets de los estudiantes.'
                        : 'La cámara está bloqueada. Actívala en los permisos de tu dispositivo.'}
                </Text>
                {permiso.canAskAgain && (
                    <Pressable style={styles.permisoButton} onPress={pedirPermiso}>
                        <Text style={styles.permisoButtonText}>Permitir cámara</Text>
                    </Pressable>
                )}
            </View>
        );
    }
    if (errorCamara) {
        return (
            <View style={styles.cameraPlaceholder}>
                <Text style={styles.placeholderText}>{errorCamara}</Text>
            </View>
        );
    }
    return (
        <>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing={frontal ? 'front' : 'back'}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={({ data }) => onCodigo(data)}
                onMountError={() => setErrorCamara('No se pudo abrir la cámara. Puedes probar con el modo de demostración.')}
            />
            <LineaDeEscaneo />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cambiar de cámara"
                onPress={() => setFrontal((actual) => !actual)}
                style={styles.voltear}
            >
                <Text style={styles.voltearTexto}>Cambiar cámara</Text>
            </Pressable>
        </>
    );
}

// Para presentar con un solo dispositivo. Los codigos pasan por la misma validacion
// del servidor que los de la camara, incluido el rechazo de una captura vencida.
function PanelDemo({ reunionId, onCodigo }) {
    const [abierto, setAbierto] = useState(false);
    const { datos: pendientes } = useDatosEnVivo(() => obtenerCodigosDemo(reunionId), {
        intervalo: 3000,
        clave: reunionId,
        habilitado: abierto,
    });

    return (
        <View style={styles.demoPanel}>
            <Pressable onPress={() => setAbierto((actual) => !actual)} style={styles.demoHeader}>
                <Text style={styles.demoTitulo}>Modo demostración (sin segundo celular)</Text>
                <Text style={styles.demoFlecha}>{abierto ? '▾' : '▸'}</Text>
            </Pressable>
            {abierto && pendientes?.length === 0 && (
                <Text style={styles.demoVacio}>Ya no quedan estudiantes pendientes.</Text>
            )}
            {abierto && pendientes?.slice(0, 5).map((pendiente) => (
                <View key={pendiente.codigo} style={styles.demoFila}>
                    <Text style={styles.demoNombre} numberOfLines={1}>{pendiente.nombre}</Text>
                    <Pressable style={styles.demoBoton} onPress={() => onCodigo(pendiente.codigoVigente)}>
                        <Text style={styles.demoBotonTexto}>Ticket</Text>
                    </Pressable>
                    <Pressable style={styles.demoBotonCaptura} onPress={() => onCodigo(pendiente.codigoVencido)}>
                        <Text style={styles.demoBotonCapturaTexto}>Captura</Text>
                    </Pressable>
                </View>
            ))}
        </View>
    );
}

export default function EscanearQR({ navigation, route }) {
    const enFoco = useIsFocused();
    const [seleccionId, setSeleccionId] = useState(null);
    const [resultado, setResultado] = useState(null);
    const enviando = useRef(false);
    const ignorados = useRef(new Map());

    const pedida = route.params?.reunionId;
    useEffect(() => {
        if (pedida) setSeleccionId(pedida);
    }, [pedida]);

    const { datos: reuniones, cargando, error } = useDatosEnVivo(listarReuniones, { intervalo: 15000 });
    const activas = (reuniones ?? []).filter((reunion) => reunion.escaneoActivo);
    const reunion = activas.find((item) => item.id === seleccionId) ?? activas[0];
    const reunionId = reunion?.id;

    useEffect(() => {
        setResultado(null);
        ignorados.current.clear();
    }, [reunionId]);

    const { datos: reporte, recargar } = useDatosEnVivo(() => obtenerReporte(reunionId), {
        intervalo: 3000,
        clave: reunionId,
        habilitado: !!reunionId,
    });

    const procesarCodigo = async (codigo) => {
        if (enviando.current) return;

        // La camara lee el mismo QR varias veces por segundo. Un ticket ya resuelto se
        // ignora completo (su codigo cambia cada 5 s aunque sea el mismo celular); un
        // rechazo solo ignora ese codigo, para no bloquear luego el ticket verdadero.
        const ticketId = codigo.split('.')[1] ?? codigo;
        const ahora = Date.now();
        if ((ignorados.current.get(ticketId) ?? 0) > ahora || (ignorados.current.get(codigo) ?? 0) > ahora) return;

        enviando.current = true;
        let clave = codigo;
        try {
            const respuesta = await escanearCodigo(reunionId, codigo);
            setResultado(respuesta);
            if (respuesta.resultado === 'REGISTRADO' || respuesta.resultado === 'DUPLICADO') {
                clave = ticketId;
            }
            if (Platform.OS !== 'web') {
                Vibration.vibrate(respuesta.resultado === 'REGISTRADO' ? 100 : [0, 100, 80, 100]);
            }
            recargar();
        } catch (e) {
            setResultado({ resultado: 'ERROR', mensaje: e.message });
        } finally {
            ignorados.current.set(clave, Date.now() + MS_IGNORAR_MISMO_TICKET);
            enviando.current = false;
        }
    };

    const recientes = (reporte?.estudiantes ?? [])
        .filter((estudiante) => estudiante.registradoEn)
        .sort((a, b) => b.registradoEn - a.registradoEn)
        .slice(0, ULTIMOS_REGISTROS);
    const resumen = reporte?.resumen;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {cargando && <ActivityIndicator color="#12A889" style={styles.espera} />}
                {!cargando && !reunion && (
                    <View style={styles.sinSesion}>
                        <Text style={styles.title}>Sin sesiones activas</Text>
                        <Text style={styles.sinSesionTexto}>
                            {error ?? 'El escáner se abre 15 minutos antes de que empiece una reunión a tu cargo.'}
                        </Text>
                        <Pressable
                            style={styles.programarButton}
                            onPress={() => navigation.navigate('ProgramarReunion')}
                        >
                            <Text style={styles.programarButtonText}>Programar una reunión</Text>
                        </Pressable>
                    </View>
                )}

                {reunion && (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.eyebrow}>ESCANEO ACTIVO</Text>
                            <Text style={styles.title}>{reunion.titulo}</Text>
                            <Text style={styles.subtitle}>
                                Registrados: {resumen?.registrados ?? reunion.registrados} / {resumen?.total ?? reunion.total} estudiantes
                            </Text>
                        </View>

                        {activas.length > 1 && (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.sesiones}
                                style={styles.sesionesScroll}
                            >
                                {activas.map((item) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => setSeleccionId(item.id)}
                                        style={[styles.sesionChip, item.id === reunionId && styles.sesionChipActiva]}
                                    >
                                        <Text style={[styles.sesionTexto, item.id === reunionId && styles.sesionTextoActiva]}>
                                            {item.titulo}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}

                        <View style={styles.scanner}>
                            {enFoco ? (
                                <Camara onCodigo={procesarCodigo} />
                            ) : (
                                <View style={styles.cameraPlaceholder} />
                            )}
                        </View>

                        {resultado ? (
                            <TarjetaResultado resultado={resultado} />
                        ) : (
                            <Text style={styles.ayuda}>
                                Enfoca el ticket en vivo del estudiante. Las capturas se rechazan.
                            </Text>
                        )}

                        <PanelDemo reunionId={reunionId} onCodigo={procesarCodigo} />

                        {recientes.length > 0 && (
                            <View style={styles.recientes}>
                                <Text style={styles.recientesTitulo}>Últimos registros</Text>
                                {recientes.map((estudiante) => (
                                    <View key={estudiante.id} style={styles.recienteFila}>
                                        <Text style={styles.recienteNombre} numberOfLines={1}>{estudiante.nombre}</Text>
                                        <Text style={styles.recienteHora}>{formatearHora(estudiante.registradoEn)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#0E172D', flex: 1 },
    container: { flexGrow: 1, paddingBottom: 20, paddingHorizontal: 20, paddingTop: 18 },
    espera: { marginTop: 60 },
    sinSesion: { alignItems: 'center', marginTop: 60, paddingHorizontal: 8 },
    sinSesionTexto: { color: '#AEB9CB', fontSize: 14, lineHeight: 21, marginTop: 10, textAlign: 'center' },
    programarButton: { backgroundColor: '#12A889', borderRadius: 10, marginTop: 22, paddingHorizontal: 22, paddingVertical: 13 },
    programarButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    header: { alignItems: 'center' },
    eyebrow: { color: '#12A889', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
    title: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginTop: 5, textAlign: 'center' },
    subtitle: { color: '#AEB9CB', fontSize: 13, marginTop: 4 },
    sesionesScroll: { flexGrow: 0, marginTop: 12 },
    sesiones: { gap: 8 },
    sesionChip: { borderColor: '#3A4A66', borderRadius: 18, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
    sesionChipActiva: { backgroundColor: '#12A889', borderColor: '#12A889' },
    sesionTexto: { color: '#AEB9CB', fontSize: 13, fontWeight: '700' },
    sesionTextoActiva: { color: '#FFFFFF' },
    scanner: { alignSelf: 'center', backgroundColor: '#26333A', borderColor: '#12A889', borderRadius: 16, borderWidth: 2, height: ALTO_ESCANER, marginTop: 14, overflow: 'hidden', width: '100%' },
    cameraPlaceholder: { alignItems: 'center', flex: 1, gap: 14, justifyContent: 'center', padding: 20 },
    placeholderText: { color: '#D8E1D6', fontSize: 14, lineHeight: 20, textAlign: 'center' },
    permisoButton: { backgroundColor: '#12A889', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11 },
    permisoButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    scanLine: { backgroundColor: '#E65D5D', height: 2, left: 0, pointerEvents: 'none', position: 'absolute', right: 0, top: 0 },
    voltear: { backgroundColor: 'rgba(14, 23, 45, 0.7)', borderRadius: 14, bottom: 8, paddingHorizontal: 12, paddingVertical: 6, position: 'absolute', right: 8 },
    voltearTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    ayuda: { color: '#8FA2B8', fontSize: 13, lineHeight: 18, marginTop: 14, textAlign: 'center' },
    resultCard: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', marginTop: 14, minHeight: 64, paddingHorizontal: 12, paddingVertical: 10 },
    checkCircle: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
    checkText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    resultCopy: { flex: 1, marginLeft: 10 },
    resultEyebrow: { fontSize: 12, fontWeight: '800', lineHeight: 16 },
    studentName: { color: '#172B4D', fontSize: 15, fontWeight: '800', marginTop: 2 },
    studentCode: { color: '#526173', fontSize: 12, marginTop: 1 },
    demoPanel: { backgroundColor: '#17233D', borderRadius: 12, marginTop: 14, padding: 12 },
    demoHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
    demoTitulo: { color: '#AEB9CB', flex: 1, fontSize: 13, fontWeight: '700' },
    demoFlecha: { color: '#AEB9CB', fontSize: 14, marginLeft: 8 },
    demoVacio: { color: '#8FA2B8', fontSize: 13, marginTop: 10 },
    demoFila: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 10 },
    demoNombre: { color: '#FFFFFF', flex: 1, fontSize: 13, fontWeight: '600' },
    demoBoton: { backgroundColor: '#12A889', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
    demoBotonTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
    demoBotonCaptura: { backgroundColor: '#FBE1DE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
    demoBotonCapturaTexto: { color: '#C0392B', fontSize: 12, fontWeight: '800' },
    recientes: { marginTop: 16 },
    recientesTitulo: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginBottom: 6 },
    recienteFila: { alignItems: 'center', borderBottomColor: '#22304D', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    recienteNombre: { color: '#D8E1EE', flex: 1, fontSize: 13, paddingRight: 10 },
    recienteHora: { color: '#8FA2B8', fontSize: 13 },
});
