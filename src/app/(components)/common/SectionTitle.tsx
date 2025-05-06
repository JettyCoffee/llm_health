'use client';
import React from 'react';
import { Typography, Divider } from '@mui/material';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <>
      <Typography 
        variant="h5" 
        component="h3" 
        gutterBottom 
        sx={{ 
          fontWeight: '500', 
          mt: 4, 
          mb: subtitle ? 1 : 2, 
          color: 'text.primary' 
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{mb: 2}}>
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mb: 3 }} />
    </>
  );
} 