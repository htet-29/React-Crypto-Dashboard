import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";

import "chartjs-adapter-date-fns";
import { useState, useEffect } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
);

const API_URL = import.meta.env.VITE_COIN_API_URL;

const CoinChart = ({ coinId }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/${coinId}/market_chart?vs_currency=usd&days=7`,
        );

        if (!res.ok) throw new Error("Failed to fetch chart data");

        const data = await res.json();

        const prices = data?.prices.map((price) => ({
          x: price[0],
          y: price[1],
        }));

        if (isMounted) {
          setChartData({
            datasets: [
              {
                label: "Price (USD)",
                data: prices,
                fill: true,
                borderColor: "#007bff",
                backgroundColor: "rgba(0, 123, 255, 0.1)",
                pointRadius: 0,
                tension: 0.3,
              },
            ],
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();

    return () => {
      isMounted = false;
    };
  }, [coinId]);

  if (loading) return <p>Loading Chart...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ marginTop: "30px" }}>
      {chartData && (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { mode: "index", intersect: false },
            },
            scales: {
              x: {
                type: "time",
                time: {
                  unit: "day",
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 7,
                },
              },
              y: {
                ticks: {
                  callback: (value) => `$${value.toLocaleString()}`,
                },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default CoinChart;
