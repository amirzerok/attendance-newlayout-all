import React, { useEffect, useState, useRef } from 'react';
import { Loader, Camera, Power, Maximize2, Settings, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { Box, Typography, IconButton, Button, MenuItem, Select, Card, CardContent, Grid, CircularProgress } from '@mui/material';

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const videoRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/status');
      const { online } = await res.json();
      setIsOnline(online);

      if (videoRef.current && online) {
        videoRef.current.src = `http://localhost:5000/video_feed?t=${Date.now()}`;
      }
    } catch (error) {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    checkStatus();
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #1a202c, #2d3748)', p: 4 }}>
      <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
        <Box ref={containerRef} sx={{ position: 'relative', bgcolor: 'grey.900', borderRadius: 3, boxShadow: 5, overflow: 'hidden' }}>

          {/* Header */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1.5}>
                <Camera style={{ color: 'white', width: 24, height: 24 }} />
                <Typography variant="h5" color="white" fontWeight="bold">
                  Security Camera Feed
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 'medium', bgcolor: isOnline ? 'success.light' : 'error.light', color: isOnline ? 'success.main' : 'error.main' }}>
                  {isOnline ? 'LIVE' : 'OFFLINE'}
                </Typography>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isOnline ? 'success.main' : 'error.main', animation: 'pulse 1.5s infinite' }} />
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ position: 'relative' }}>
            {loading ? (
              <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={600} bgcolor="grey.900">
                <CircularProgress color="primary" sx={{ mb: 2 }} />
                <Typography color="grey.500">Connecting to camera...</Typography>
              </Box>
            ) : (
              <Box position="relative">
                <img
                  ref={videoRef}
                  src={`http://localhost:5000/video_feed?t=${Date.now()}`}
                  alt="Live camera feed"
                  style={{ width: '100%', height: 600, objectFit: 'cover', opacity: isOnline ? 1 : 0.4, filter: isOnline ? 'none' : 'grayscale(100%)', transition: 'all 0.3s ease' }}
                  onError={() => setIsOnline(false)}
                />
                {!isOnline && (
                  <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="rgba(0, 0, 0, 0.5)">
                    <Power style={{ color: 'red', width: 64, height: 64, marginBottom: 16 }} />
                    <Typography variant="h6" color="white">Camera Offline</Typography>
                    <Button onClick={handleRefresh} variant="contained" color="primary" sx={{ mt: 2 }} startIcon={<RefreshCw style={{ width: 16, height: 16 }} />}>
                      Retry Connection
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Controls */}
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => setIsMuted(!isMuted)} color="inherit">
                  {isMuted ? <VolumeX style={{ color: 'white' }} /> : <Volume2 style={{ color: 'white' }} />}
                </IconButton>
                <IconButton onClick={() => setIsSettingsOpen(!isSettingsOpen)} color="inherit">
                  <Settings style={{ color: 'white' }} />
                </IconButton>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={handleRefresh} color="inherit">
                  <RefreshCw style={{ color: 'white' }} />
                </IconButton>
                <IconButton onClick={toggleFullscreen} color="inherit">
                  <Maximize2 style={{ color: 'white' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Settings Panel */}
          {isSettingsOpen && (
            <Box position="absolute" bottom={80} right={16} bgcolor="grey.900" borderRadius={2} boxShadow={3} p={2} width={256}>
              <Typography variant="subtitle1" color="white" mb={2}>Camera Settings</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="grey.500">Resolution</Typography>
                <Select defaultValue="1080p" variant="outlined" size="small" sx={{ bgcolor: 'grey.800', color: 'white', borderRadius: 1 }}>
                  <MenuItem value="1080p">1080p</MenuItem>
                  <MenuItem value="720p">720p</MenuItem>
                  <MenuItem value="480p">480p</MenuItem>
                </Select>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="grey.500">Frame Rate</Typography>
                <Select defaultValue="30 fps" variant="outlined" size="small" sx={{ bgcolor: 'grey.800', color: 'white', borderRadius: 1 }}>
                  <MenuItem value="30 fps">30 fps</MenuItem>
                  <MenuItem value="24 fps">24 fps</MenuItem>
                  <MenuItem value="15 fps">15 fps</MenuItem>
                </Select>
              </Box>
            </Box>
          )}
        </Box>

        {/* Info Cards */}
        <Grid container spacing={2} mt={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(45, 55, 72, 0.5)', backdropFilter: 'blur(5px)' }}>
              <CardContent>
                <Typography variant="subtitle1" color="white" gutterBottom>Stream Info</Typography>
                <Typography variant="body2" color="grey.500">Resolution: 1080p</Typography>
                <Typography variant="body2" color="grey.500">Bitrate: 2.5 Mbps</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(45, 55, 72, 0.5)', backdropFilter: 'blur(5px)' }}>
              <CardContent>
                <Typography variant="subtitle1" color="white" gutterBottom>Network Status</Typography>
                <Typography variant="body2" color="grey.500">Latency: 150ms</Typography>
                <Typography variant="body2" color="grey.500">Signal: Strong</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(45, 55, 72, 0.5)', backdropFilter: 'blur(5px)' }}>
              <CardContent>
                <Typography variant="subtitle1" color="white" gutterBottom>Camera Details</Typography>
                <Typography variant="body2" color="grey.500">Model: HD-2000</Typography>
                <Typography variant="body2" color="grey.500">Location: Main Entrance</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App;