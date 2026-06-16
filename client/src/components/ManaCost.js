import { jsx as _jsx } from "react/jsx-runtime";
export function ManaCost(props) {
    if (!props.value) {
        return null;
    }
    const tokens = props.value.match(/\{[^}]+\}/g) ?? [];
    if (!tokens.length) {
        return _jsx("span", { className: "mana-cost mana-cost--text", children: props.value });
    }
    return (_jsx("span", { className: "mana-cost", "aria-label": props.value, children: tokens.map((token, index) => {
            const normalized = token.replace(/[{}]/g, '').replace(/\//g, '').toUpperCase();
            return (_jsx("img", { className: "mana-symbol", src: `https://svgs.scryfall.io/card-symbols/${normalized}.svg`, alt: normalized, loading: "lazy" }, `${token}-${index}`));
        }) }));
}
