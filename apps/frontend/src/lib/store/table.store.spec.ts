import { renderHook, act } from '@testing-library/react';
import { useTableStore } from '@/lib/store/table.store';

beforeEach(() => {
  useTableStore.setState({
    client: null,
    roomState: null,
    connected: false,
    error: null,
    selectedTokenId: null,
    toolMode: 'select',
    showSheet: false,
    showInitiative: false,
    showFog: true,
  });
});

describe('useTableStore', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useTableStore());
    expect(result.current.toolMode).toBe('select');
    expect(result.current.showFog).toBe(true);
    expect(result.current.connected).toBe(false);
  });

  it('selects a token', () => {
    const { result } = renderHook(() => useTableStore());
    act(() => { result.current.selectToken('token-abc'); });
    expect(result.current.selectedTokenId).toBe('token-abc');
  });

  it('deselects a token', () => {
    const { result } = renderHook(() => useTableStore());
    act(() => { result.current.selectToken('token-abc'); });
    act(() => { result.current.selectToken(null); });
    expect(result.current.selectedTokenId).toBeNull();
  });

  it('changes tool mode', () => {
    const { result } = renderHook(() => useTableStore());
    act(() => { result.current.setToolMode('measure'); });
    expect(result.current.toolMode).toBe('measure');
  });

  it('toggles fog', () => {
    const { result } = renderHook(() => useTableStore());
    act(() => { result.current.toggleFog(); });
    expect(result.current.showFog).toBe(false);
    act(() => { result.current.toggleFog(); });
    expect(result.current.showFog).toBe(true);
  });

  it('toggles sheet panel', () => {
    const { result } = renderHook(() => useTableStore());
    act(() => { result.current.toggleSheet(); });
    expect(result.current.showSheet).toBe(true);
  });

  it('sets error', () => {
    const { result } = renderHook(() => useTableStore());
    act(() => { result.current.setError('Connection failed'); });
    expect(result.current.error).toBe('Connection failed');
    act(() => { result.current.setError(null); });
    expect(result.current.error).toBeNull();
  });
});
