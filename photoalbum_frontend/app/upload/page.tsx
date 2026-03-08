'use client';

import { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, Box, Paper, 
  Alert, CircularProgress 
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function UploadPage() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) {
      setStatus({ type: 'error', msg: 'Kérlek adj meg egy nevet és válassz ki egy képet!' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', name);

    try {
      await api.post('photos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus({ type: 'success', msg: 'A kép sikeresen feltöltve!' });
      // 2 másodperc múlva visszairányítunk a galériába
      setTimeout(() => router.push('/'), 200);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Hiba történt a feltöltés során.';
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Új fotó feltöltése
        </Typography>

        {status && (
          <Alert severity={status.type} sx={{ mb: 3 }}>
            {status.msg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Kép címe"
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="raised-button-file">
              <Button 
                variant="outlined" 
                component="span" 
                fullWidth 
                startIcon={<PhotoCamera />}
                sx={{ py: 1.5 }}
              >
                Kép kiválasztása
              </Button>
            </label>
          </Box>

          {preview && (
            <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={preview} 
                alt="Előnézet" 
                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} 
              />
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Feltöltés indítása'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => router.push('/')}
            sx={{ mt: 1 }}
          >
            Mégse
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}