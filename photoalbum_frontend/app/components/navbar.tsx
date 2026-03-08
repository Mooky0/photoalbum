'use client';

import { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material';
import Link from 'next/link';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: "background.paper", 
          color: "text.primary", 
          boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.1)"
        }}
      >
        <Container maxWidth="lg"> {}
          <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: "bold", 
                textDecoration: 'none',
                color: 'inherit',
                lineHeight: 1,
                m: 0 
              }}
              component={Link}
              href="/"
            >
              Photo Album
            </Typography>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {isLoggedIn ? (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={handleLogout}
                    sx={{ borderRadius: "8px" }}
                  >
                    Logout
                  </Button>
                  <Button component={Link} href="/upload" size="small">
                    Upload
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button 
                    variant="text" 
                    component={Link} 
                    href="/register"
                    size="small"
                  >
                    Register
                  </Button>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    href="/login"
                    size="small"
                    sx={{ borderRadius: "8px" }}
                  >
                    Login
                  </Button>
                </Box>
              )}
            </Box>
            
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}