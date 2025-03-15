import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate, useLocation } from "react-router-dom"; // For navigation

function LoginComponent() {
  const [email, setEmail] = useState(""); // Email for login
  const [password, setPassword] = useState(""); // Password for login
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState(""); // Username for registration
  const [error, setError] = useState(""); // For login/registration errors
  const navigate = useNavigate();
  const location = useLocation(); // To get the previous page location

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send email and password for login
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Login successful:", data);
        localStorage.setItem("token", data.token);
        // Redirect to the previous page or home page
        navigate(location.state?.from || "/");
        window.location.reload();
      } else {
        setError("Incorrect email or password"); // Set error message
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_name: username, email, password }), // Send username, email, and password for registration
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful:", data);
        setIsRegistering(false); // Switch to login page
        setError(""); // Clear any errors
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#0a192f", // Very dark blue background
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {isRegistering ? "Register" : "Login"}
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

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
            sx={{ fontSize: "0.875rem", fontFamily: "cursive" }} // Smaller size and fancy font
          >
            {isRegistering ? "Already have an account? Login" : "You don't have an account? Register"}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          Need help? Contact support for assistance.
        </Alert>
      </Box>
    </Box>
  );
}

export default LoginComponent;