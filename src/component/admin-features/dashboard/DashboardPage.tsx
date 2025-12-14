import React from 'react';
import { Card, Button, Grid, Box, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import './DashboardPage.css';

// Mock data for charts
const barData = [
  { name: 'At sea', value: 400 },
  { name: 'In port', value: 300 },
  { name: 'Drifting', value: 200 },
  { name: 'Manoeuvring', value: 100 },
];

const lineData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const pieData = [
  { name: 'Inbound EUA', value: 400 },
  { name: 'Outbound EUA', value: 300 },
  { name: 'Domestic', value: 300 },
];

const COLORS = ['#0E2BB3', '#36A2EB', '#4BC0C0'];

const DashboardPage: React.FC = () => {
  return (
    <Box className="dashboard">
      <Box className="dashboard-content">
        <Box component="main" className="main-content">
          <Grid container spacing={3} className="dashboard-grid">
            {/* Small cards */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={item}>
                <Card className="dashboard-card small-card">
                  <Box className="card-content">
                    <Box>
                      <Typography variant="subtitle2" className="card-title">
                        Available Balance
                      </Typography>
                      <Typography variant="h5" className="card-amount">
                        ₹40,500
                      </Typography>
                    </Box>
                    <Box className="card-pattern"></Box>
                  </Box>
                </Card>
              </Grid>
            ))}

            {/* Chart cards */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="dashboard-card chart-card">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Lorem ipsum
                  </Typography>
                  <Box className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0E2BB3" barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box className="chart-legend">
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot blue"></Box>{' '}
                      Actual
                    </Box>
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot blue"></Box>{' '}
                      Estimated
                    </Box>
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot gray"></Box>{' '}
                      Difference
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="dashboard-card chart-card highlighted">
                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h6">Lorem ipsum</Typography>
                    <Button
                      variant="text"
                      startIcon={<DownloadIcon />}
                      className="download-btn"
                    >
                      Download
                    </Button>
                  </Box>
                  <Box className="chart-container">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0E2BB3"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#4CAF50"
                          strokeWidth={2}
                          dot={false}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box className="chart-legend">
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot green"></Box>{' '}
                      Actual
                    </Box>
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot blue"></Box>{' '}
                      Estimated
                    </Box>
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot gray"></Box>{' '}
                      Difference
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="dashboard-card chart-card">
                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h6">Lorem ipsum</Typography>
                    <Button
                      variant="text"
                      startIcon={<DownloadIcon />}
                      className="download-btn"
                    >
                      Download
                    </Button>
                  </Box>
                  <Box className="pie-chart-container">
                    <Box className="pie-chart">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pie-center-text"
                          >
                            Total
                            <tspan x="50%" dy="1.2em">
                              6500
                            </tspan>
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box className="pie-legend">
                      {pieData.map((entry, index) => (
                        <Box key={`legend-${index}`} className="legend-item">
                          <Box
                            component="span"
                            className="legend-dot"
                            sx={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></Box>
                          {entry.name}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box className="chart-legend">
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot green"></Box>{' '}
                      Actual
                    </Box>
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot blue"></Box>{' '}
                      Estimated
                    </Box>
                    <Box className="legend-item">
                      <Box component="span" className="legend-dot gray"></Box>{' '}
                      Difference
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
