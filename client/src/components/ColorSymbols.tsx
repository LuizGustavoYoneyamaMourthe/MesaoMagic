type ColorSymbolsProps = {
  colors: string[];
  size?: 'sm' | 'md';
  className?: string;
};

function manaSymbolUrl(color: string) {
  return `https://svgs.scryfall.io/card-symbols/${color.toUpperCase()}.svg`;
}

export function ColorSymbols(props: ColorSymbolsProps) {
  const colors = props.colors.length ? props.colors : ['C'];

  return (
    <div className={`color-symbols ${props.className || ''}`.trim()}>
      {colors.map((color) => (
        <span className={`color-symbol-wrap color-symbol-wrap--${props.size || 'md'}`} key={color}>
          <img className="color-symbol" src={manaSymbolUrl(color)} alt={color} loading="lazy" />
        </span>
      ))}
    </div>
  );
}
