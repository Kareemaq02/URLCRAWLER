import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../../../shared-theme/AppTheme";
import ColorModeSelect from "../../../shared-theme/ColorModeSelect";
import { CrawlIcon } from "../../../components/CustomIcons";
import { signup } from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/Auth/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";

type Props = {
  onSwitch: () => void; // callback to switch to Sign In form
  disableCustomTheme?: boolean; // optional flag to disable custom theming
};

// Styled Card container with adaptive width and box shadow depending on theme
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

// Container with radial background and padding
const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  position: "relative",
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp({ onSwitch, disableCustomTheme }: Props) {
  // Form state variables
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Validation error states and messages
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState("");
  const [generalError, setGeneralError] = React.useState("");

  // Loading state
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Regex for names - only letters and spaces
  const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

  // Updated email regex:
  // Only letters, digits, dot, underscore, percent, plus, minus allowed before the @
  // Basic domain validation after the @
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Validate all inputs, set error messages accordingly
  const validateInputs = () => {
    let valid = true;

    if (!firstName.trim() || !lastName.trim()) {
      setNameError(true);
      setNameErrorMessage("First and last name are required.");
      valid = false;
    } else if (
      !nameRegex.test(firstName.trim()) ||
      !nameRegex.test(lastName.trim())
    ) {
      setNameError(true);
      setNameErrorMessage("Names must contain only letters.");
      valid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    // Password must have uppercase, lowercase, number, special char, min 8 chars
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#~$%^&*()_+{}[\]:;"'<>,.?/\\|`-]).{8,}$/;

    if (!password || !strongPasswordRegex.test(password)) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      valid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return valid;
  };

  // Handle form submit
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) return;

    setLoading(true);

    try {
      setGeneralError(""); // clear old errors on retry
      const token = await signup(
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        password
      );
      login(token);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setEmailError(true);
        setEmailErrorMessage("This email is already in use.");
      } else {
        setGeneralError("Something went wrong. Please try again later.");
        console.error("Signup error:", err);
      }
      setLoading(false);
    }
  };

  return (
    <AppTheme disableCustomTheme={disableCustomTheme}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <CrawlIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <FormLabel htmlFor="firstName">First name</FormLabel>
                <TextField
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  placeholder="Jon"
                  error={nameError}
                  helperText={nameError ? nameErrorMessage : ""}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel htmlFor="lastName">Last name</FormLabel>
                <TextField
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  placeholder="Snow"
                  error={nameError}
                  helperText={nameError ? nameErrorMessage : ""}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormControl>
            </Stack>

            <FormControl fullWidth>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                autoComplete="email"
                required
                placeholder="your@email.com"
                error={emailError}
                helperText={emailErrorMessage}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                error={passwordError}
                helperText={passwordErrorMessage}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Button type="submit" fullWidth variant="contained">
                <CircularProgress size={20} aria-label="loading" />
              </Button>
            ) : (
              <Button type="submit" fullWidth variant="contained">
                Sign up
              </Button>
            )}
            {generalError && (
              <Typography
                role="alert"
                sx={{ color: "error.main", mt: 1, textAlign: "center" }}
              >
                {generalError}
              </Typography>
            )}
          </Box>
          <Typography sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitch}
              sx={{ alignSelf: "center" }}
            >
              Sign in
            </Link>
          </Typography>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
