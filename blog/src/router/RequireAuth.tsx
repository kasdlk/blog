import { Navigate } from "react-router-dom";
import {JSX} from "react";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default RequireAuth;
