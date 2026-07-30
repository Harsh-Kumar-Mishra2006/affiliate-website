// pages/Login.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Chip,
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Storefront,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email or username is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Login failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  const roleLinks = [
    {
      role: "admin",
      label: "Admin",
      icon: <AdminPanelSettings fontSize="small" />,
    },
    {
      role: "affiliate",
      label: "Affiliate",
      icon: <Storefront fontSize="small" />,
    },
    { role: "user", label: "User", icon: <Person fontSize="small" /> },
  ];

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <LoginIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Sign in to your account to continue
            </Typography>
          </Box>

          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 3 }}
          >
            {roleLinks.map((item) => (
              <Chip
                key={item.role}
                icon={item.icon}
                label={item.label}
                size="small"
                variant="outlined"
                onClick={() => {
                  const demos: Record<
                    string,
                    { email: string; password: string }
                  > = {
                    admin: { email: "admin@example.com", password: "admin123" },
                    affiliate: {
                      email: "affiliate@example.com",
                      password: "affiliate123",
                    },
                    user: { email: "user@example.com", password: "user123" },
                  };
                  const demo = demos[item.role];
                  if (demo) {
                    setFormData(demo);
                    toast.success(`Demo ${item.role} credentials loaded!`);
                  }
                }}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Username"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{ textDecoration: "none" }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              OR
            </Typography>
          </Divider>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/signup"
                variant="body2"
                sx={{ fontWeight: "bold", textDecoration: "none" }}
              >
                Create one now
              </Link>
            </Typography>
          </Box>

          <Box
            sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 2 }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              💡 Demo Accounts:
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              Admin: admin@example.com / admin123
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              Affiliate: affiliate@example.com / affiliate123
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              User: user@example.com / user123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
