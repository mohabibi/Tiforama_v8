import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const GridContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
});

const ColorSquare = styled(Box)<{ 
  $color?: string; 
  $isActive?: boolean;
  $size: number;
}>(({ $color, $isActive, $size }) => ({
  width: $size,
  height: $size,
  backgroundColor: $color || '#333',
  border: $isActive ? '2px solid #1db954' : '1px solid #666',
  borderRadius: '4px',
  transition: 'all 0.2s ease',
  position: 'relative',
  cursor: 'default',
  boxShadow: $isActive ? '0 0 8px rgba(29, 185, 84, 0.5)' : 'none',
}));

const RowContainer = styled(Box)({
  display: 'flex',
  gap: '4px',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
});

const UnderlineBar = styled(Box)<{ $color?: string; $width: number }>(({ $color, $width }) => ({
  height: '2px',
  width: $width,
  backgroundColor: $color || '#666',
  marginTop: '4px',
  borderRadius: '1px',
}));

const BlockInfo = styled(Typography)({
  fontSize: '10px',
  color: '#999',
  textAlign: 'center',
  marginTop: '2px',
});

export const ColorGrid: React.FC = () => {
  const { currentData, currentIndex, isPlaying } = useSelector((state: RootState) => state.tifo);

  if (!currentData || !currentData.colors.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="textSecondary">
          Aucune donnée de couleur disponible
        </Typography>
      </Box>
    );
  }

  const COLUMNS_PER_ROW = 10;
  const SPACING = 4;
  
  // Calculer la taille des carrés basée sur la largeur disponible
  const calculateSquareSize = (containerWidth: number = 800) => {
    const availableWidth = containerWidth - (SPACING * (COLUMNS_PER_ROW - 1));
    return Math.floor(availableWidth / COLUMNS_PER_ROW);
  };

  const squareSize = calculateSquareSize();

  // Organiser les couleurs en lignes de 10
  const rows: number[][] = [];
  for (let i = 0; i < currentData.colors.length; i += COLUMNS_PER_ROW) {
    rows.push(currentData.colors.slice(i, i + COLUMNS_PER_ROW));
  }

  // Trouver tous les blocs de couleurs (changements de couleur)
  const findColorBlocks = () => {
    const blocks: Array<{
      color: number;
      startIndex: number;
      endIndex: number;
    }> = [];
    
    let startIndex = 0;
    let currentColor = currentData.colors[0];

    for (let i = 1; i < currentData.colors.length; i++) {
      if (currentData.colors[i] !== currentColor) {
        blocks.push({
          color: currentColor,
          startIndex,
          endIndex: i - 1
        });
        startIndex = i;
        currentColor = currentData.colors[i];
      }
    }
    
    // Ajouter le dernier bloc
    blocks.push({
      color: currentColor,
      startIndex,
      endIndex: currentData.colors.length - 1
    });

    return blocks;
  };

  const colorBlocks = findColorBlocks();

  // Obtenir la couleur hex d'un index de couleur
  const getColorHex = (colorIndex: number): string => {
    if (colorIndex > 0 && colorIndex <= currentData.palette.length) {
      return currentData.palette[colorIndex - 1];
    }
    return '#333';
  };

  // Vérifier si un index est dans le bloc actuel
  const isInCurrentBlock = (index: number): boolean => {
    if (!isPlaying) return false;
    
    const currentBlock = colorBlocks.find(block => 
      currentIndex >= block.startIndex && currentIndex <= block.endIndex
    );
    
    return currentBlock ? 
      (index >= currentBlock.startIndex && index <= currentBlock.endIndex) : 
      false;
  };

  return (
    <GridContainer>
      {/* Grille principale */}
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RowContainer>
            {row.map((colorIndex, colIndex) => {
              const globalIndex = rowIndex * COLUMNS_PER_ROW + colIndex;
              const colorHex = getColorHex(colorIndex);
              const isActive = globalIndex === currentIndex && isPlaying;
              const isInCurrentBlockRange = isInCurrentBlock(globalIndex);
              
              return (
                <ColorSquare
                  key={globalIndex}
                  $color={colorHex}
                  $isActive={isActive}
                  $size={squareSize}
                  sx={{
                    opacity: isPlaying ? (isInCurrentBlockRange ? 1 : 0.3) : 1,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              );
            })}
          </RowContainer>
        </Box>
      ))}

      {/* Barres de soulignement pour les blocs */}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
        {colorBlocks.map((block, blockIndex) => {
          const colorHex = getColorHex(block.color);
          const isCurrentBlock = isPlaying && 
            currentIndex >= block.startIndex && 
            currentIndex <= block.endIndex;
          
          // Calculer les positions des lignes pour ce bloc
          const startRow = Math.floor(block.startIndex / COLUMNS_PER_ROW);
          const endRow = Math.floor(block.endIndex / COLUMNS_PER_ROW);
          
          const blockBars = [];
          for (let row = startRow; row <= endRow; row++) {
            const rowStartCol = row === startRow ? block.startIndex % COLUMNS_PER_ROW : 0;
            const rowEndCol = row === endRow ? block.endIndex % COLUMNS_PER_ROW : COLUMNS_PER_ROW - 1;
            const rowWidth = (rowEndCol - rowStartCol + 1) * squareSize + 
                           (rowEndCol - rowStartCol) * SPACING;
            
            blockBars.push(
              <Box key={`${blockIndex}-${row}`} sx={{ textAlign: 'center' }}>
                <UnderlineBar
                  $color={isCurrentBlock ? '#1db954' : colorHex}
                  $width={rowWidth}
                  sx={{
                    opacity: isCurrentBlock ? 1 : 0.6,
                    height: isCurrentBlock ? '3px' : '2px',
                  }}
                />
                {row === endRow && (
                  <BlockInfo>
                    Bloc {blockIndex + 1} • {block.endIndex - block.startIndex + 1} places
                  </BlockInfo>
                )}
              </Box>
            );
          }
          
          return blockBars;
        })}
      </Box>

      {/* Informations sur l'animation */}
      {isPlaying && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="primary">
            Animation en cours • Position: {currentIndex + 1}/{currentData.colors.length}
          </Typography>
        </Box>
      )}
    </GridContainer>
  );
};