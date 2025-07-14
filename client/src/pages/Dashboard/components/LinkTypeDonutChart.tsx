import { useEffect, useState } from "react";
import { fetchLinkTypeStats } from "../../../api/urls";
import { CircularProgress, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4caf50", "#f44336"]; // Internal - green, External - red

export default function LinkTypeDonutChart({ urlId }: { urlId: number }) {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await fetchLinkTypeStats(urlId);
        setData([
          { name: "Internal", value: stats.internal },
          { name: "External", value: stats.external },
        ]);
      } catch (err: any) {
        setError("Failed to load link type statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [urlId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  if (data.length === 0 || data.every((item) => item.value === 0)) {
    return (
      <Typography variant="body2" color="text.secondary">
        No internal or external links to display.
      </Typography>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={50}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
