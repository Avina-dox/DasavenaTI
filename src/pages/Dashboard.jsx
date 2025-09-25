import { useAuth } from "../auth/AuthProvider";
import Background from "../components/Background";

export default function Dashboard() {
    const { user, logout } = useAuth();
    return (
        <div>
                <Background />

            <div className="scale-z-200 " >
                <h2>¡Hola, {user?.name ?? "usuario"}!</h2>
                <p>Correo: {user?.email}</p>
                <button onClick={logout}>Cerrar sesión</button>

            </div>
        </div>
    );
}
