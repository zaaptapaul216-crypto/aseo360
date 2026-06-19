import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top" style={{
            background: 'linear-gradient(90deg, #0D63A5, #0A4F8C)',
            borderBottom: '1px solid #162C44',
            borderTop: '6px solid #B6E300',
            height: '60px',
            zIndex: 1000
        }}>
            <div className="container-fluid">
                <button className="btn text-white me-3" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </button>
                <Link className="navbar-brand text-white fw-bold" to="/">
                    Panel Administrativo
                </Link>

                <div className="ms-auto d-flex align-items-center">
                    <div className="dropdown">
                        <button className="btn text-white dropdown-toggle d-flex align-items-center" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                            <div className="text-end me-2 d-none d-sm-block">
                                <div className="small fw-bold lh-1">{user?.nombreCompleto || 'Usuario'}</div>
                                <div className="lh-1" style={{ fontSize: '10px', opacity: 0.8 }}>{user?.roleName || 'Empleado'}</div>
                            </div>
                            <img
                                src={user?.fotoPerfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombreCompleto || 'U')}&background=random`}
                                alt="Avatar"
                                className="rounded-circle border"
                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userMenu">
                            <li className="px-3 py-2 border-bottom d-sm-none">
                                <div className="fw-bold small">{user?.nombreCompleto}</div>
                                <div className="text-muted" style={{ fontSize: '10px' }}>{user?.roleName}</div>
                            </li>
                            <li><button className="dropdown-item py-2" type="button"><i className="fas fa-user-circle me-2"></i> Mi Perfil</button></li>
                            <li><button className="dropdown-item py-2" type="button"><i className="fas fa-cog me-2"></i> Configuración</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><button className="dropdown-item py-2 text-danger fw-bold" type="button" onClick={handleLogout}><i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión</button></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
