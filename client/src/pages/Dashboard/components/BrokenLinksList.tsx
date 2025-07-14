import { useEffect, useState } from "react";
import { fetchBrokenLinks } from "../../../api/urls";
import {
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

type BrokenLink = {
  href: string;
  status_code: number;
};

export default function BrokenLinksList({ urlId }: { urlId: number }) {
  const [links, setLinks] = useState<BrokenLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBrokenLinks() {
      try {
        const result = await fetchBrokenLinks(urlId);
        setLinks(result);
      } catch (err: any) {
        setError("Failed to fetch broken links.");
      } finally {
        setLoading(false);
      }
    }

    loadBrokenLinks();
  }, [urlId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (links.length === 0) {
    return <Typography>No broken links found 🎉</Typography>;
  }

  return (
    <List dense>
      {links.map((link, idx) => (
        <ListItem key={idx}>
          <ListItemText
            primary={link.href}
            secondary={`Status code: ${link.status_code}`}
          />
        </ListItem>
      ))}
    </List>
  );
}
