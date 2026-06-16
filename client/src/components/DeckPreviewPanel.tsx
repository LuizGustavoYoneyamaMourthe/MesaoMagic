import type { DeckMetrics, PreviewCard } from '../deck-builder';
import { formatDeckLabel, formatUsd, getCardImage } from '../deck-builder';
import { ColorSymbols } from './ColorSymbols';
import { ManaCost } from './ManaCost';

type DeckPreviewPanelProps = {
  format?: string;
  previewCard: PreviewCard | null;
  fallbackName?: string;
  metrics: DeckMetrics;
  mode: 'editor' | 'viewer';
};

export function DeckPreviewPanel(props: DeckPreviewPanelProps) {
  const previewImage = props.previewCard ? getCardImage(props.previewCard) : '';
  const previewMeta = [props.previewCard?.setCode?.toUpperCase(), props.previewCard?.rarity, formatUsd(props.previewCard?.priceUsd)].filter(
    (value) => value && value !== '—'
  );
  const statsMeta = [props.format ? formatDeckLabel(props.format) : '', props.metrics.deckTarget ? `${props.metrics.deckCount}/${props.metrics.deckTarget} cartas` : 'Deck livre'].filter(
    Boolean
  );
  const pipEntries = Object.entries(props.metrics.colorPips).filter(([, count]) => count > 0) as Array<[string, number]>;
  const maxPips = pipEntries.reduce((max, [, count]) => Math.max(max, count), 1);

  return (
    <aside className="panel preview-panel">
      <section className="preview-card">
        <div className="preview-image-wrap">
          {previewImage ? (
            <img className="preview-image" src={previewImage} alt={props.previewCard?.name || 'Preview'} />
          ) : (
            <div className="preview-placeholder">Passe o mouse sobre uma carta para ver o preview</div>
          )}
        </div>

        {props.previewCard ? (
          <div className="preview-copy">
            <div className="preview-copy__top">
              <h2>{props.previewCard.name}</h2>
              <ManaCost value={props.previewCard.manaCost} />
            </div>
            <p>{props.previewCard.typeLine || 'Carta sem tipo'}</p>
            {previewMeta.length ? <div className="preview-meta-line">{previewMeta.join(' · ')}</div> : null}
          </div>
        ) : props.mode === 'editor' && props.fallbackName ? (
          <div className="preview-copy preview-copy--empty">
            <h2>{props.fallbackName}</h2>
          </div>
        ) : null}
      </section>

      <div className="stats-panel">
        <div className="panel-header">
          <h3>Estatisticas</h3>
        </div>
        {statsMeta.length ? <div className="preview-meta-line">{statsMeta.join(' · ')}</div> : null}

        <div className="stats-grid">
          <article>
            <strong>{props.metrics.deckCount}</strong>
            <span>Cartas</span>
          </article>
          <article>
            <strong>{props.metrics.avgCmc.toFixed(2)}</strong>
            <span>CMC medio</span>
          </article>
          <article>
            <strong>{props.metrics.lands}</strong>
            <span>Terrenos</span>
          </article>
          <article>
            <strong>{formatUsd(props.metrics.estimatedPrice)}</strong>
            <span>Valor estimado</span>
          </article>
        </div>

        {props.mode === 'editor' ? (
          <div className="stats-grid">
            <article>
              <strong>{props.metrics.deckTarget ? `${props.metrics.deckCount}/${props.metrics.deckTarget}` : 'Livre'}</strong>
              <span>Meta</span>
            </article>
            <article>
              <strong>{props.metrics.mainCount}/{props.metrics.sideCount}/{props.metrics.commandCount}</strong>
              <span>Main/Side/Command</span>
            </article>
          </div>
        ) : null}

        <div className="curve-block">
          <div className="curve-title">Curva de mana</div>
          <div className="curve-chart">
            {props.metrics.deckCurve.map((bucket) => (
              <div className="curve-bar" key={bucket.label}>
                <div className="curve-bar__fill" style={{ height: `${Math.max(bucket.count * 12, bucket.count ? 12 : 0)}px` }} />
                <span>{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>

        {pipEntries.length ? (
          <div className="pip-bars">
            <div className="curve-title">Pips por cor</div>
            <div className="pip-bars__list">
              {pipEntries.map(([color, count]) => (
                <div className={`pip-bar-row pip-bar-row--${color.toLowerCase()}`} key={color}>
                  <ColorSymbols colors={[color]} size="sm" />
                  <div className="pip-bar-track">
                    <div className="pip-bar-fill" style={{ width: `${(count / maxPips) * 100}%` }} />
                  </div>
                  <span className="pip-bar-value">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
