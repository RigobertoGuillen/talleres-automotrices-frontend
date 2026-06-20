import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

const usuarios = [
    {
        username: "admin",
        password: "admin123",
        rol: "admin"
    },
    {
        username: "Usuario1",
        password: "user123",
        rol: "recepcionista"
    },
    {
        username: "Usuario2",
        password: "user123",
        rol: "mecanico"
    }
];

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const login = (username, password) => {

        const usuario = usuarios.find(
            u =>
                u.username.toLowerCase() === username.toLowerCase() &&
                u.password === password
        );

        if (!usuario) return false;

        setUser(usuario);

        return usuario;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);