import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';

// Composant personnalisé pour l'affichage "XXX/YYY"
const PlaceInputContainer = styled('div')({
  position: 'relative',
  width: '100%',
  marginBottom: '24px',
});

const PlaceInputField = styled('input')<{ $hasClicked?: boolean }>(({ $hasClicked }) => ({
  width: '100%',
  height: '56px',
  backgroundColor: '#2a2a2a',
  border: 'none',
  borderRadius: '12px',
  color: $hasClicked ? 'transparent' : 'rgba(255, 255, 255, 0.4)',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '0 12px',
  outline: 'none',
  caretColor: '#FF0000',
  cursor: 'pointer',
  '&:focus': {
    outline: 'none',
    color: 'transparent',
  },
  '&::placeholder': {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '16px',
    fontWeight: 'normal',
  }
}));

const PlaceDisplayOverlay = styled('div')<{ $isVisible?: boolean }>(({ $isVisible }) => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  pointerEvents: 'none',
  display: $isVisible ? 'flex' : 'none',
  alignItems: 'center',
  padding: '0 12px',
  fontSize: '16px',
  fontWeight: 'bold',
}));

const PlaceholderOverlay = styled('div')<{ $tifoSelected?: boolean }>(({ $tifoSelected }) => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  fontSize: '16px',
  fontWeight: 'normal',
  color: $tifoSelected ? '#90EE90' : 'rgba(255, 255, 255, 0.4)', // Vert pistache si tifo sélectionné, sinon blanc semi-transparent
}));

const UserInput = styled('span')({
  color: '#FF0000', // Rouge pour la saisie utilisateur
});

const TotalDisplay = styled('span')({
  color: 'rgba(255, 255, 255, 0.4)', // Blanc semi-transparent pour le total
});

interface PlaceInputProps {
  value: string;
  onChange: (value: string) => void;
  totalPlaces: number;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

export const PlaceInput: React.FC<PlaceInputProps> = ({
  value,
  onChange,
  totalPlaces,
  disabled = false,
  error = false,
  placeholder = ""
}) => {
  const [hasClicked, setHasClicked] = useState(false);

  // Détecter si un tifo est sélectionné (totalPlaces > 0)
  const tifoSelected = totalPlaces > 0;

  // Reset hasClicked when totalPlaces changes (new tifo selected)
  useEffect(() => {
    if (totalPlaces === 0) {
      setHasClicked(false);
    }
  }, [totalPlaces]);

  const handleClick = () => {
    if (!disabled) {
      setHasClicked(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    // Ne garder que les chiffres
    inputValue = inputValue.replace(/[^0-9]/g, '');
    onChange(inputValue);
  };

  const handleFocus = () => {
    if (!disabled) {
      setHasClicked(true);
    }
  };

  // Texte du placeholder selon l'état
  const getPlaceholderText = () => {
    if (!tifoSelected) {
      return "saisissez votre numéro de place";
    }
    return hasClicked ? "" : "saisissez votre numéro de place";
  };

  // Détermine ce qu'il faut afficher
  const showPlaceholder = !hasClicked && !value; // Afficher le placeholder si pas cliqué ET pas de valeur
  const showTotalFormat = hasClicked && tifoSelected;

  return (
    <PlaceInputContainer>
      <PlaceInputField
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onClick={handleClick}
        disabled={disabled}
        $hasClicked={hasClicked}
        placeholder=""
      />
      
      {/* Placeholder personnalisé */}
      {showPlaceholder && (
        <PlaceholderOverlay $tifoSelected={tifoSelected}>
          {getPlaceholderText()}
        </PlaceholderOverlay>
      )}
      
      {/* Format "/nombre_total" quand on clique */}
      {showTotalFormat && (
        <PlaceDisplayOverlay $isVisible={true}>
          <UserInput>{value}</UserInput>
          <TotalDisplay>/{totalPlaces}</TotalDisplay>
        </PlaceDisplayOverlay>
      )}
    </PlaceInputContainer>
  );
};
