'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Button, TextField } from '@mui/material'
import api from '@/lib/axios'
 
export default function LoginPage() {
  const router = useRouter()
 
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
 
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')
    const confirm_password = formData.get('confirm_password')

    if (password !== confirm_password) {
      alert('Passwords do not match')
      return
    }

    const response = await api.post('register/', { username, password })
    if (response.status === 201) {
      router.push('/login')
    } else {
      alert('Registration failed')
    }
  }
 
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800 }}>
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
        <TextField
          type="password"
          name="confirm_password"
          label="Confirm Password"
          variant="outlined"
          required
          fullWidth
        />
        <Button type="submit" variant="contained" fullWidth>
          Register
        </Button>
      </Box>
    </form>
  )
}