import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/store/auth.store';
import { UserRole } from '@vtt/shared-types';

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
  });
});

describe('useAuthStore', () => {
  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated()).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('sets tokens and marks authenticated', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setTokens('access-token', 'refresh-token');
    });
    expect(result.current.isAuthenticated()).toBe(true);
    expect(result.current.accessToken).toBe('access-token');
  });

  it('sets user profile', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser({
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Tester',
        roles: [UserRole.PLAYER],
      });
    });
    expect(result.current.user?.displayName).toBe('Tester');
  });

  it('clears state on logout', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setTokens('access', 'refresh');
      result.current.setUser({ id: '1', email: 'a@b.com', displayName: 'A', roles: [] });
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated()).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
