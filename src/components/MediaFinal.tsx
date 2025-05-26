import React from 'react';

interface MediaFinalProps {
  notas: number[];
}

const MediaFinal: React.FC<MediaFinalProps> = ({ notas }) => {
  const somaNotas = notas.reduce((acc, nota) => acc + nota, 0);
  const media = somaNotas / notas.length;

  return (
    <div>
      <h3>Média Final: {media.toFixed(2)}</h3>
    </div>
  );
};

export default MediaFinal;
