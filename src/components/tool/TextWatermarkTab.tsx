import { useWatermark } from '../../contexts/WatermarkContext';

export function TextWatermarkTab() {
  const { state, dispatch } = useWatermark();

  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor="wm-text">Text</label>
      <input type="text" id="wm-text" value={state.text}
        onChange={(e) => dispatch({ type: 'SET_TEXT', value: e.target.value })} />

      <label htmlFor="wm-font">Font</label>
      <select id="wm-font" value={state.font}
        onChange={(e) => dispatch({ type: 'SET_FONT', value: e.target.value })}>
        <option>Arial</option><option>Georgia</option><option>Impact</option>
        <option>Courier New</option><option>Times New Roman</option>
        <option>Verdana</option><option>Trebuchet MS</option>
      </select>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div>
          <label htmlFor="wm-size">Size (px)</label>
          <input type="number" id="wm-size" value={state.size} min={8} max={400}
            onChange={(e) => dispatch({ type: 'SET_SIZE', value: Number(e.target.value) })} />
        </div>
        <div>
          <label htmlFor="wm-style">Style</label>
          <select id="wm-style" value={state.style}
            onChange={(e) => dispatch({ type: 'SET_STYLE', value: e.target.value })}>
            <option value="">Normal</option><option value="bold">Bold</option>
            <option value="italic">Italic</option><option value="bold italic">Bold Italic</option>
          </select>
        </div>
      </div>

      <label htmlFor="wm-color">Color</label>
      <div className="flex items-center gap-2.5">
        <input type="color" id="wm-color" value={state.color.slice(0, 7)}
          onChange={(e) => dispatch({ type: 'SET_COLOR', value: e.target.value })} />
        <input type="text" id="wm-color-hex" value={state.color} maxLength={9}
          onChange={(e) => dispatch({ type: 'SET_COLOR', value: e.target.value })}
          className="flex-1" />
      </div>
    </div>
  );
}
