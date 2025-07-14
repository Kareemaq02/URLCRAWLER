import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import LinkTypeDonutChart from "./LinkTypeDonutChart";
import BrokenLinksList from "./BrokenLinksList";

export default function UrlAnalytics({
  urlId,
  url,
  onBack,
}: {
  urlId: number;
  url: string;
  onBack: () => void;
}) {
  return (
    <Box p={2}>
      <Button onClick={onBack} variant="outlined" sx={{ mb: 2 }}>
        ← Back to Table
      </Button>

      <Typography variant="h6" gutterBottom>
        Analytics for:
      </Typography>
      {url ? (
        <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
          {url}
        </Typography>
      ) : (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
          Loading URL...
        </Typography>
      )}

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Internal vs External Links
        </Typography>
        <LinkTypeDonutChart urlId={urlId} />
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Broken Links
        </Typography>
        <BrokenLinksList urlId={urlId} />
      </Paper>
    </Box>
  );
}
