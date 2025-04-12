import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        alert("Page not found. Redirecting to the index page.");
        navigate("/"); // Redirect to the index page after alert
    }, [navigate]);

    return null;
}