import React from 'react';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const GridContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

const Row = styled('div')({
  display: 'flex',
  gap: 4,
  position: 'relative',
});

const IconSquare = styled(motion.div)<{ $color: string }>(({ $color }) => ({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: `drop-shadow(0 0 2px ${$color}) brightness(0) saturate(100%) ${$color}`,
  },
}));

const BlockUnderline = styled('div')({
  height: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  marginTop: 2,
  position: 'absolute',
  bottom: -4,
});

const SQUARES_PER_ROW = 10;

export const IconGrid: React.FC = () => {
  const { currentData, currentIndex, isPlaying } = useSelector(
    (state: RootState) => state.tifo
  );

  if (!currentData?.icons) return null;

  const { colors, palette, icons } = currentData;
  const rows = Math.ceil(colors.length / SQUARES_PER_ROW);

  const getBlockRanges = () => {
    const ranges: { start: number; end: number; color: number }[] = [];
    let currentColor = colors[0];
    let startIndex = 0;

    colors.forEach((color, index) => {
      if (color !== currentColor || index === colors.length - 1) {
        ranges.push({
          start: startIndex,
          end: index === colors.length - 1 ? index : index - 1,
          color: currentColor,
        });
        currentColor = color;
        startIndex = index;
      }
    });

    return ranges;
  };

  const blockRanges = getBlockRanges();

  return (
    <GridContainer>
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const startIdx = rowIndex * SQUARES_PER_ROW;
        const rowColors = colors.slice(startIdx, startIdx + SQUARES_PER_ROW);

        return (
          <Row key={rowIndex}>
            {rowColors.map((colorIndex, colIndex) => {
              const index = startIdx + colIndex;
              const color = palette[colorIndex - 1];
              const iconIndex = icons[colorIndex % icons.length];
              const isExpired = isPlaying && index < currentIndex;

              return (
                <IconSquare
                  key={index}
                  $color={color}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isExpired ? 0 : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <img 
                    src={`/assets/images/${iconIndex}.png`}
                    alt={`Icon ${iconIndex}`}
                  />
                </IconSquare>
              );
            })}
            {blockRanges
              .filter(range => {
                const rangeStart = range.start;
                const rangeEnd = range.end;
                const rowStart = startIdx;
                const rowEnd = startIdx + SQUARES_PER_ROW - 1;
                return rangeStart <= rowEnd && rangeEnd >= rowStart;
              })
              .map(range => {
                const start = Math.max(range.start - startIdx, 0);
                const end = Math.min(range.end - startIdx, SQUARES_PER_ROW - 1);
                const width = (end - start + 1) * 44 - 4;

                return (
                  <BlockUnderline
                    key={`${range.start}-${range.end}`}
                    style={{
                      left: start * 44,
                      width,
                    }}
                  />
                );
              })}
          </Row>
        );
      })}
    </GridContainer>
  );
};