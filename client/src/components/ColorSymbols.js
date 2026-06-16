import { jsx as _jsx } from "react/jsx-runtime";
function manaSymbolUrl(color) {
    return `https://svgs.scryfall.io/card-symbols/${color.toUpperCase()}.svg`;
}
export function ColorSymbols(props) {
    const colors = props.colors.length ? props.colors : ['C'];
    return (_jsx("div", { className: `color-symbols ${props.className || ''}`.trim(), children: colors.map((color) => (_jsx("span", { className: `color-symbol-wrap color-symbol-wrap--${props.size || 'md'}`, children: _jsx("img", { className: "color-symbol", src: manaSymbolUrl(color), alt: color, loading: "lazy" }) }, color))) }));
}
