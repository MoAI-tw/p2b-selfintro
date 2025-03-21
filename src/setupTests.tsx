// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock localStorage
class LocalStorageMock implements Storage {
  private store: Record<string, string>;
  length: number = 0;
  
  constructor() {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
  
  clear(): void {
    this.store = {};
    this.length = 0;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
    this.length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this.length = Object.keys(this.store).length;
  }
}

// 全局模擬 localStorage
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true
});

// 模擬 window.scrollTo
window.scrollTo = jest.fn();

// 模擬 URL 操作
window.URL.createObjectURL = jest.fn(() => 'mock-url');
window.URL.revokeObjectURL = jest.fn();

// 模擬 clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});

// 模擬 Vite 環境變數
(global as any).import = {
  meta: {
    env: {
      VITE_OPENAI_API_KEY: 'mock-openai-key',
      VITE_GEMINI_API_KEY: 'mock-gemini-key',
      VITE_APP_VERSION: '1.0.0-test',
    }
  }
};
