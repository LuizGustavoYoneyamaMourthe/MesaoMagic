export function ManaCost(props: { value?: string }) {
  if (!props.value) {
    return null;
  }

  const tokens = props.value.match(/\{[^}]+\}/g) ?? [];
  if (!tokens.length) {
    return <span className="mana-cost mana-cost--text">{props.value}</span>;
  }

  return (
    <span className="mana-cost" aria-label={props.value}>
      {tokens.map((token, index) => {
        const normalized = token.replace(/[{}]/g, '').replace(/\//g, '').toUpperCase();
        return (
          <img
            className="mana-symbol"
            key={`${token}-${index}`}
            src={`https://svgs.scryfall.io/card-symbols/${normalized}.svg`}
            alt={normalized}
            loading="lazy"
          />
        );
      })}
    </span>
  );
}
