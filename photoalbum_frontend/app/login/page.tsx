'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast';
import { Alert, Box, Button, CircularProgress, TextField } from '@mui/material'
import api from '@/lib/axios'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    try {
      const response = await api.post('login/', { username, password });
      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        toast.success('Login successful! 🎉');
        window.location.href = '/';
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800 }}>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          type="username"
          name="username"
          label="Username"
          variant="outlined"
          required
          fullWidth
        />
        <TextField
          type="password"
          name="password"
          label="Password"
          variant="outlined"
          required
          fullWidth
        />
        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </Box>
    </form>
  )
}