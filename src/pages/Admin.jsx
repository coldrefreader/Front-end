import "../styles/App.css";
import "../styles/Admin.css";
import "../styles/Animations.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/admin/users", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched users:", data); // Log fetched data
          // Sort users by role (admins first) and then by username alphabetically
          const sortedUsers = data.sort((a, b) => {
            if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
            if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
            return a.username.localeCompare(b.username);
          });
          setUsers(sortedUsers);
        } else {
          setError("Failed to fetch users");
        }
      } catch (error) {
        setError("Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleActiveStatus = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/v1/admin/users/${userId}/status`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === userId ? { ...user, active: !user.active } : user));
      } else {
        setError("Failed to toggle active status");
      }
    } catch (error) {
      setError("Error toggling active status");
    }
  };

  const toggleUserRole = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/v1/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === userId ? { ...user, role: user.role === "USER" ? "ADMIN" : user.role } : user));
      } else {
        setError("Failed to toggle user role");
      }
    } catch (error) {
      setError("Error toggling user role");
    }
  };

  useEffect(() => {
    const checkAdminPermission = async () => {
      try {
        const response = await fetch("http://localhost:8080/v1/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.role !== "ADMIN") {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        navigate("/");
      }
    };

    checkAdminPermission();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="admin-container">
      <h2>Admin Page</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.active ? "Active" : "Inactive"}</td>
              <td>
                {user.role !== "ADMIN" && (
                  <button onClick={() => toggleActiveStatus(user.id)}>
                    {user.active ? "Deactivate" : "Activate"}
                  </button>
                )}
                {user.role === "USER" && user.active && (
                  <button onClick={() => toggleUserRole(user.id)}>
                    Make Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, index) => (
          <button key={index + 1} onClick={() => paginate(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
      <button className="back-button" onClick={() => navigate("/home")}>Back</button>
    </div>
  );
}