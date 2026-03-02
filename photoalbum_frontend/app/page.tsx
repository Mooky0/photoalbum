'use client';
import { useEffect, useState } from 'react';
import { Container, ImageList, ImageListItem, ImageListItemBar, Select, MenuItem, Typography } from '@mui/material';
import { Photo, getPhotos } from '@/lib/axios';

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ordering, setOrdering] = useState('-uploaded_at');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPhotos(ordering)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setPhotos(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Hiba történt:", err);
        setLoading(false);
      });
  }, [ordering]);

  const formatDate = (dateStr: string) => {
    try {
      const isoStr = dateStr.replace(' ', 'T');
      const date = new Date(isoStr);
      return date.toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      
      <Select 
        value={ordering} 
        onChange={(e) => setOrdering(e.target.value)} 
        sx={{ mb: 3, minWidth: 200 }}
      >
        <MenuItem value="name">By name (A-Z)</MenuItem>
        <MenuItem value="-name">By name (Z-A)</MenuItem>
        <MenuItem value="-uploaded_at">By date (newest first)</MenuItem>
        <MenuItem value="uploaded_at">By date (oldest first)</MenuItem>
      </Select>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : photos.length === 0 ? (
        <Typography>No uploaded photos.</Typography>
      ) : (
        <ImageList cols={3} gap={12}>
          {photos.map((photo) => (
            <ImageListItem 
              key={photo.id} 
              sx={{ 
                cursor: 'pointer', 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: 3,
                '&:hover': { transform: 'scale(1.02)', transition: '0.3s' } 
              }} 
              onClick={() => window.open(photo.image, '_blank')}
            >
              <img 
                src={photo.image} 
                alt={photo.name} 
                loading="lazy" 
                style={{ height: '250px', objectFit: 'cover' }} 
              />
              <ImageListItemBar
                title={photo.name}
                subtitle={`Owner: ${photo.owner_name} | ${formatDate(photo.uploaded_at)}`}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Container>
  );
}