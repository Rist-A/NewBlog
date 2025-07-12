import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../ThemeContext";

function LoginComponent() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const bgColor = theme === 'dark' ? 'bg-[#0a192f]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const paperBgColor = theme === 'dark' ? 'bg-[#1e293b]' : 'bg-white';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      setError(""); // Clear previous errors
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
      }
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
  
      console.log("Login successful:", data);
      
      // If role information isn't included in the login response
      if (!data.user.role && data.user.role_id) {
        const roleResponse = await fetch(`http://localhost:5000/user_roles/${data.user.role_id}`);
        if (!roleResponse.ok) {
          throw new Error("Failed to fetch role information");
        }
        const roleData = await roleResponse.json();
        data.user.role = roleData.role_name;
      }
  
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect based on role with full page reload
      switch((data.user.role || "").toLowerCase()) {
        case 'admin':
        case 'subadmin':
          window.location.assign('/admin-dashboard');
          break;
        case 'user':
          window.location.assign('/blog');
          break;
        default:
          window.location.assign(location.state?.from || '/');
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login");
    }
  };

  const handleRegister = async () => {
    try {
      setError("");
      const response = await fetch("http://localhost:5000/users", { // Added /api prefix
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          user_name: username, 
          email, 
          password 
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("Registration successful:", data);
      setIsRegistering(false);
      
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "An error occurred during registration");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
      className={bgColor}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
        className={`${paperBgColor} ${textColor}`}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {isRegistering ? "Register" : "Login"}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {isRegistering && (
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
        )}

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          InputProps={{
            endAdornment: (
              <Button onClick={togglePasswordVisibility}>
                {showPassword ? "Hide" : "Show"}
              </Button>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={isRegistering ? handleRegister : handleLogin}
          sx={{ mt: 2 }}
        >
          {isRegistering ? "Register" : "Login"}
        </Button>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            color="primary"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Already have an account? Login" : "Create an account"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginComponent;
