import { Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppTheme from "../../shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box
        textAlign="center"
        mt={15}
        px={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: "900",
            fontSize: { xs: "8rem", sm: "10rem", md: "12rem" },
            color: "text.primary",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          404
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: "700",
            color: "text.secondary",
            mb: 2,
            userSelect: "none",
          }}
        >
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: 400, color: "text.secondary", mb: 4 }}
        >
          The page you’re looking for doesn’t exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          sx={{
            px: 5,
            py: 1.5,
            fontWeight: "600",
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Go Home
        </Button>
      </Box>
    </AppTheme>
  );
}
