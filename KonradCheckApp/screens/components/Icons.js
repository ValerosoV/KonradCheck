import { View, StyleSheet } from 'react-native';

// Iconos y patrones QR dibujados con Views (no hay libreria de iconos instalada).
// Todo es puramente visual, con datos de ejemplo fijos.

function pseudoRandomBit(i, j) {
    const value = (i * 928371 + j * 123457 + i * j * 97) % 7;
    return value < 3 ? 1 : 0;
}

function applyFinderPattern(matrix, rowStart, colStart) {
    for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            matrix[rowStart + r][colStart + c] = isBorder || isCenter ? 1 : 0;
        }
    }
}

export function generateQrMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(pseudoRandomBit(i, j));
        }
        matrix.push(row);
    }
    applyFinderPattern(matrix, 0, 0);
    applyFinderPattern(matrix, 0, size - 7);
    applyFinderPattern(matrix, size - 7, 0);
    return matrix;
}

export const miniQrMatrix = generateQrMatrix(15);
export const bigQrMatrix = generateQrMatrix(21);

export function QrGrid({ matrix, cellSize = 3, color = '#0B1220' }) {
    return (
        <View>
            {matrix.map((fila, i) => (
                <View key={i} style={{ flexDirection: 'row' }}>
                    {fila.map((bit, j) => (
                        <View
                            key={j}
                            style={{
                                width: cellSize,
                                height: cellSize,
                                backgroundColor: bit ? color : 'transparent',
                            }}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}

export function HomeIcon({ color }) {
    return (
        <View style={styles.homeWrap}>
            <View style={[styles.homeRoof, { backgroundColor: color }]} />
            <View style={[styles.homeBase, { backgroundColor: color }]} />
        </View>
    );
}

export function QrIcon({ color }) {
    return (
        <View style={styles.qrGrid}>
            {[0, 1, 2, 3].map((i) => (
                <View
                    key={i}
                    style={[
                        styles.qrDot,
                        { backgroundColor: i === 2 ? 'transparent' : color },
                    ]}
                />
            ))}
        </View>
    );
}

export function HistorialIcon({ color }) {
    return (
        <View style={[styles.clockCircle, { borderColor: color }]}>
            <View style={[styles.clockHandHour, { backgroundColor: color }]} />
            <View style={[styles.clockHandMin, { backgroundColor: color }]} />
        </View>
    );
}

export function PerfilIcon({ color }) {
    return (
        <View style={styles.perfilWrap}>
            <View style={[styles.perfilHead, { backgroundColor: color }]} />
            <View style={[styles.perfilBody, { backgroundColor: color }]} />
        </View>
    );
}

export function PinIcon({ color }) {
    return <View style={[styles.pin, { backgroundColor: color }]} />;
}

export function RefreshIcon({ color }) {
    return <View style={[styles.refresh, { borderColor: color }]} />;
}

const styles = StyleSheet.create({
    homeWrap: {
        alignItems: 'center',
        height: 22,
        width: 22,
    },
    homeRoof: {
        borderRadius: 2,
        height: 12,
        marginBottom: -6,
        transform: [{ rotate: '45deg' }],
        width: 12,
    },
    homeBase: {
        borderBottomLeftRadius: 2,
        borderBottomRightRadius: 2,
        height: 9,
        width: 16,
    },
    qrGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: 18,
        width: 18,
    },
    qrDot: {
        borderRadius: 1,
        height: 7,
        margin: 1,
        width: 7,
    },
    clockCircle: {
        alignItems: 'center',
        borderRadius: 11,
        borderWidth: 2,
        height: 22,
        justifyContent: 'center',
        width: 22,
    },
    clockHandHour: {
        borderRadius: 1,
        bottom: 11,
        height: 6,
        position: 'absolute',
        width: 2,
    },
    clockHandMin: {
        borderRadius: 1,
        height: 2,
        left: 11,
        position: 'absolute',
        width: 5,
    },
    perfilWrap: {
        alignItems: 'center',
        height: 22,
        overflow: 'hidden',
        width: 22,
    },
    perfilHead: {
        borderRadius: 5,
        height: 10,
        marginBottom: 2,
        width: 10,
    },
    perfilBody: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 10,
        width: 18,
    },
    pin: {
        borderRadius: 7,
        height: 14,
        transform: [{ rotate: '45deg' }],
        width: 14,
    },
    refresh: {
        borderRadius: 7,
        borderTopColor: 'transparent',
        borderWidth: 2,
        height: 14,
        width: 14,
    },
});
