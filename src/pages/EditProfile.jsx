import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", firstName: "", lastName: "" });
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasSession, setHasSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const panelVariants = {
    enter: { y: ["-100%", "10%", "0%"], transition: { duration: 1, ease: [0.6, 0.07, 0.78, 0.335] } },
    exit: { y: ["0%", "5%", "-150%"], transition: { duration: 0.8, ease: "easeIn" } },
    selected: { y: ["0%", "5%", "-200%"], transition: { duration: 1.5, ease: [0.6, 0.07, 0.78, 0.335] } },
    fade: { opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ User session found:", data);
          setUser({ email: data.email || "", firstName: data.firstName || "", lastName: data.lastName || "" });
        } else {
          console.log("❌ No session found, redirecting.");
          sessionStorage.removeItem("username");
          setHasSession(false);
          navigate("/");
        }
      } catch (error) {
        console.error("⚠️ Error checking session:", error);
        setHasSession(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => navigate("/profile"), 800);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      console.log("📡 Sending updated profile:", user);

      const response = await fetch("http://localhost:8080/v1/auth/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });

      if (response.ok) {
        console.log("✅ Profile updated successfully!");
        setMessage("Profile updated successfully!");

        // ✅ Force-refresh session after update
        await fetch("http://localhost:8080/v1/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-cache",
        });

        setTimeout(() => navigate("/profile"), 1200);
      } else {
        throw new Error("❌ Failed to update profile.");
      }
    } catch (error) {
      console.error("⚠️ Error updating profile:", error);
      setMessage("Error updating profile. Try again.");
    }
  };

  if (!hasSession) return <h2>Redirecting to Index...</h2>;
  if (loading) return <h2>Loading...</h2>;

  return (
    <>
      <motion.div
        className={`edit-profile-container ${isLeaving ? "leaving" : ""}`}
        variants={panelVariants}
        initial={{ y: "-100%" }} // Directly set initial prop
        animate={isLeaving ? "exit" : "enter"}
      >
        <h2>Edit Profile</h2>
        <form className="edit-profile-form" onSubmit={handleSave}>
          <label>Email:</label>
          <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />

          <label>First Name:</label>
          <input type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />

          <label>Last Name:</label>
          <input type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />

          <button type="submit" className="profile-button">Save Changes</button>
        </form>
        {message && <p className="status-message">{message}</p>}
      </motion.div>

      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>Back</button>
      </div>
    </>
  );
}