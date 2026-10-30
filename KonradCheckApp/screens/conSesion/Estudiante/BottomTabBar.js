import { HomeIcon, HistorialIcon, PerfilIcon } from '../../components/Icons';
import BarraTabs from '../../components/BarraTabs';

const TABS = [
    { route: 'Reuniones', label: 'Inicio', Icon: HomeIcon },
    { route: 'Historial', label: 'Historial', Icon: HistorialIcon },
    { route: 'Perfil', label: 'Perfil', Icon: PerfilIcon },
];

const PADRES = {
    MiQR: 'Reuniones',
    CambiarContrasena: 'Perfil',
};

export default function BottomTabBar(props) {
    return <BarraTabs {...props} tabs={TABS} padres={PADRES} />;
}
