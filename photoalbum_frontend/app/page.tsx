'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import { Photo, getPhotos } from '@/lib/axios';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '@/lib/axios';

interface PhotoDialogProps {
  open: boolean;
  onClose: () => void;
  photo: Photo | null;
}

export default function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [ordering, setOrdering] = useState('-uploaded_at');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const deletePhoto = useCallback((id: number) => {
    return api.delete(`/photos/${id}/`);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedPhoto) return;
    if (confirm('Are you sure you want to delete this?')) {
      deletePhoto(selectedPhoto.id)
        .then(() => {
          setPhotos((prev) => prev.filter((p) => p.id !== selectedPhoto.id));
          setIsDialogOpen(false);
        })
        .catch((err) => {
          console.error('Error deleting photo:', err);
          alert('Failed to delete photo. Please try again.');
        });
    }
  }, [selectedPhoto, deletePhoto]);

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
        <>
          <ImageList cols={3} gap={12}>
            {photos.map((photo) => (
              <ImageListItem
                key={photo.id}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3
                }}
                onClick={() => {
                  setSelectedPhoto(photo);
                  setIsDialogOpen(true);
                }}
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
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      aria-label={`delete ${photo.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${photo.name}?`)) {
                          deletePhoto(photo.id).then(() => {
                            setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                          }).catch(console.error);
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  actionPosition="right"
                />
              </ImageListItem>
            ))}
          </ImageList>
          <PhotoGalleryDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            photo={selectedPhoto}
          />
        </>
      )}
    </Container>
  );
}

const PhotoGalleryDialog = ({ open, onClose, photo }: PhotoDialogProps) => {
  if (!photo) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' } } }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, backgroundColor: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box
          component="img"
          src={photo.image}
          alt={photo.name}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
        />

        <Box sx={{ p: 3, width: '100%', color: 'white' }}>
          <Typography variant="h6">{photo.name}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Uploaded by: {photo.owner_name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>
            Uploaded at: {new Date(photo.uploaded_at.replace(' ', 'T')).toLocaleString('hu-HU')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};