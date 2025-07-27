import React from 'react';
import { Snackbar, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { usePWA } from '../hooks/usePWA';

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(1),
}));

export const UpdatePrompt: React.FC = () => {
  const { canInstall, promptInstall, isUpdateAvailable, applyUpdate } = usePWA();

  const handleInstall = async () => {
    await promptInstall();
  };

  const handleUpdate = () => {
    applyUpdate();
    window.location.reload();
  };

  if (isUpdateAvailable) {
    return (
      <Snackbar
        open={true}
        message="Une mise à jour est disponible"
        action={
          <StyledButton size="small" onClick={handleUpdate}>
            Mettre à jour
          </StyledButton>
        }
      />
    );
  }

  if (canInstall) {
    return (
      <Snackbar
        open={true}
        message="Installer Tiforama sur votre appareil ?"
        action={
          <StyledButton size="small" onClick={handleInstall}>
            Installer
          </StyledButton>
        }
      />
    );
  }

  return null;
};