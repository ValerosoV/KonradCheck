import { HomeIcon, QrIcon, PerfilIcon } from '../../components/Icons';
import BarraTabs from '../../components/BarraTabs';

const TABS = [
    { route: 'ReunionesPersonal', label: 'Reuniones', Icon: HomeIcon },
    { route: 'EscanearQR', label: 'Escanear QR', Icon: QrIcon },
    { route: 'Perfil', label: 'Perfil', Icon: PerfilIcon },
];

const PADRES = {
    ProgramarReunion: 'ReunionesPersonal',
    ReporteAsistencia: 'ReunionesPersonal',
    CambiarContrasena: 'Perfil',
};

export default function BottomTabBarPersonal(props) {
    return <BarraTabs {...props} tabs={TABS} padres={PADRES} />;
}
