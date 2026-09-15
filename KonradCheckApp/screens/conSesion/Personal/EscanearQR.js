import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import BottomTabBarPersonal from './BottomTabBarPersonal';

export default function EscanearQR({ navigation }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>ESCANEO ACTIVO</Text>
                    <Text style={styles.title}>Sistemas Operativos - G1</Text>
                    <Text style={styles.subtitle}>Registrados: 12 / 35 estudiantes</Text>
                </View>

                <View style={styles.scanner}>
                    <View style={styles.cameraScene}>
                        <View style={styles.ceilingLight} />
                        <View style={styles.screenFrame}>
                            <View style={styles.screenContent} />
                        </View>
                        <View style={[styles.desk, styles.deskOne]} />
                        <View style={[styles.desk, styles.deskTwo]} />
                        <View style={[styles.desk, styles.deskThree]} />
                        <View style={styles.scanLine} />
                    </View>
                </View>

                <View style={styles.successCard}>
                    <View style={styles.checkCircle}>
                        <Text style={styles.checkText}>✓</Text>
                    </View>
                    <View style={styles.successCopy}>
                        <Text style={styles.successEyebrow}>Registro Exitoso</Text>
                        <Text style={styles.studentName}>Juan Carlos Guerrero</Text>
                        <Text style={styles.studentCode}>Código: 21934820</Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => navigation.navigate('ReunionesPersonal')}
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>Volver a reuniones</Text>
                </Pressable>
            </View>
            <BottomTabBarPersonal navigation={navigation} active="EscanearQR" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: '#0E172D', flex: 1 },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
    header: { alignItems: 'center' },
    eyebrow: { color: '#12A889', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
    title: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginTop: 5, textAlign: 'center' },
    subtitle: { color: '#AEB9CB', fontSize: 9, marginTop: 3 },
    scanner: { alignSelf: 'center', borderColor: '#12A889', borderRadius: 13, borderWidth: 2, height: 216, marginTop: 14, overflow: 'hidden', width: '100%' },
    cameraScene: { backgroundColor: '#26333A', flex: 1, overflow: 'hidden' },
    ceilingLight: { alignSelf: 'center', backgroundColor: '#D8E1D6', height: 16, marginTop: 25, opacity: 0.8, width: 70 },
    screenFrame: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#6D7771', height: 54, justifyContent: 'center', marginTop: 30, width: 78 },
    screenContent: { backgroundColor: '#E6E5D4', height: 37, width: 53 },
    desk: { backgroundColor: '#131B24', borderRadius: 3, height: 9, position: 'absolute', width: 95 },
    deskOne: { bottom: 34, left: 15 },
    deskTwo: { bottom: 18, right: 2 },
    deskThree: { bottom: 5, left: 40 },
    scanLine: { backgroundColor: '#E65D5D', height: 2, left: 0, position: 'absolute', right: 0, top: '52%' },
    successCard: { alignItems: 'center', backgroundColor: '#C9F6EA', borderRadius: 8, flexDirection: 'row', marginTop: 62, minHeight: 48, paddingHorizontal: 10 },
    checkCircle: { alignItems: 'center', backgroundColor: '#12A889', borderRadius: 10, height: 20, justifyContent: 'center', width: 20 },
    checkText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
    successCopy: { marginLeft: 8 },
    successEyebrow: { color: '#087C71', fontSize: 7, fontWeight: '800' },
    studentName: { color: '#172B4D', fontSize: 10, fontWeight: '800', marginTop: 2 },
    studentCode: { color: '#526173', fontSize: 7, marginTop: 1 },
    backButton: { alignItems: 'center', marginTop: 22 },
    backButtonText: { color: '#8FA2B8', fontSize: 10, fontWeight: '700' },
});
