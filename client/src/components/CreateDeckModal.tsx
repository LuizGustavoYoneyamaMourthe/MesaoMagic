type CreateDeckModalProps = {
  loading: boolean;
  newDeckName: string;
  newDeckFormat: string;
  onClose: () => void;
  onChangeName: (value: string) => void;
  onChangeFormat: (value: string) => void;
  onCreate: () => void;
};

export function CreateDeckModal(props: CreateDeckModalProps) {
  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="panel-header">
          <h2>Novo deck</h2>
          <button className="secondary-button" onClick={props.onClose}>Cancelar</button>
        </div>
        <div className="form-stack">
          <label>
            <span>Nome</span>
            <input value={props.newDeckName} onChange={(event) => props.onChangeName(event.target.value)} placeholder="Meu deck incrivel" />
          </label>
          <label>
            <span>Formato</span>
            <select value={props.newDeckFormat} onChange={(event) => props.onChangeFormat(event.target.value)}>
              <option value="commander">Commander / EDH</option>
              <option value="standard">Standard / Modern</option>
              <option value="generic">Generico</option>
            </select>
          </label>
          <button onClick={props.onCreate} disabled={props.loading}>Criar deck</button>
        </div>
      </div>
    </div>
  );
}
