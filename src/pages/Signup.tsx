// pages/Signup.tsx
import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  RadioGroup,
  Radio,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  PersonAdd,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Person,
  Storefront,
  CheckCircle,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user" as "admin" | "affiliate" | "user",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    {
      value: "admin" as const,
      label: "Admin",
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      description: "Full system access & management",
      color: theme.palette.error.main,
    },
    {
      value: "affiliate" as const,
      label: "Affiliate",
      icon: <Storefront sx={{ fontSize: 40 }} />,
      description: "Earn commissions & manage referrals",
      color: theme.palette.success.main,
    },
    {
      value: "user" as const,
      label: "User",
      icon: <Person sx={{ fontSize: 40 }} />,
      description: "Regular user access",
      color: theme.palette.primary.main,
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleSelect = (role: "admin" | "affiliate" | "user") => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.role) {
        newErrors.role = "Please select a role";
      }
    } else if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.username.trim()) {
        newErrors.username = "Username is required";
      } else if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Invalid phone number";
      }
    } else if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      await signup(signupData);
      toast.success(
        `Welcome ${formData.name}! Your ${formData.role} account has been created.`,
      );
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Signup failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Choose Your Role
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Select the account type that best suits your needs
            </Typography>

            <RadioGroup
              value={formData.role}
              onChange={(e) => handleRoleSelect(e.target.value as any)}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {roles.map((role) => (
                  <Card
                    key={role.value}
                    sx={{
                      cursor: "pointer",
                      border:
                        formData.role === role.value
                          ? `3px solid ${role.color}`
                          : "1px solid #e0e0e0",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                    onClick={() => handleRoleSelect(role.value)}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: `${role.color}15`,
                            color: role.color,
                          }}
                        >
                          {role.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{role.label}</Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            {role.description}
                          </Typography>
                        </Box>
                        <Radio
                          value={role.value}
                          checked={formData.role === role.value}
                          sx={{ color: role.color }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </RadioGroup>
            {errors.role && (
              <FormHelperText error>{errors.role}</FormHelperText>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Enter your personal details to create your account
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                required
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Set Password
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
              Create a strong password for your account
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || "Minimum 6 characters"}
                required
                slotProps={{
                  input: {
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
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <PersonAdd sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Create Account
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Already have an account?{" "}
            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              Login here
            </Button>
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Role</StepLabel>
            </Step>
            <Step>
              <StepLabel>Profile</StepLabel>
            </Step>
            <Step>
              <StepLabel>Password</StepLabel>
            </Step>
          </Stepper>

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>

              {activeStep === 2 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  endIcon={<CheckCircle />}
                  sx={{ px: 4 }}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              By creating an account, you agree to our{" "}
              <Button variant="text" sx={{ textTransform: "none" }}>
                Terms of Service
              </Button>
              {" and "}
              <Button variant="text" sx={{ textTransform: "none" }}>
                Privacy Policy
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;
