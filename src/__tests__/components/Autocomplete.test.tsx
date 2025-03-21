import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // 引入以使用 toBeInTheDocument 等擴展方法
import userEvent from '@testing-library/user-event';
import Autocomplete from '../../components/Autocomplete';

describe('Autocomplete 組件', () => {
  const mockSuggestions = ['React', 'TypeScript', 'JavaScript', 'Redux', 'Node.js'];
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('渲染時顯示輸入框和占位符', () => {
    render(
      <Autocomplete
        suggestions={mockSuggestions}
        value=""
        onChange={mockOnChange}
        placeholder="輸入技能"
      />
    );
    
    expect(screen.getByPlaceholderText('輸入技能')).toBeInTheDocument();
  });

  test('輸入文字時過濾建議列表', async () => {
    render(
      <Autocomplete
        suggestions={mockSuggestions}
        value=""
        onChange={mockOnChange}
        placeholder="輸入技能"
      />
    );
    
    const input = screen.getByPlaceholderText('輸入技能');
    await userEvent.type(input, 'Ja');
    
    // 確保 onChange 被調用且帶有正確參數
    // 實際上 userEvent.type 會為每個字符單獨調用 onChange
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('a');
  });

  test('顯示過濾後的建議列表', () => {
    render(
      <Autocomplete
        suggestions={mockSuggestions}
        value="Ty"
        onChange={mockOnChange}
        placeholder="輸入技能"
      />
    );
    
    // 點擊輸入框顯示建議
    fireEvent.focus(screen.getByPlaceholderText('輸入技能'));
    
    // 應該只看到 TypeScript
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  test('點擊建議項目更新輸入值', () => {
    render(
      <Autocomplete
        suggestions={mockSuggestions}
        value="Re"
        onChange={mockOnChange}
        placeholder="輸入技能"
      />
    );
    
    // 點擊輸入框顯示建議
    fireEvent.focus(screen.getByPlaceholderText('輸入技能'));
    
    // 點擊 React 建議
    fireEvent.click(screen.getByText('React'));
    
    // 確保 onChange 被調用且帶有正確參數
    expect(mockOnChange).toHaveBeenCalledWith('React');
  });

  test('處理無效值的情況', () => {
    // 測試當值為 undefined 時不會發生錯誤
    render(
      <Autocomplete
        suggestions={mockSuggestions}
        value={undefined as any}
        onChange={mockOnChange}
        placeholder="輸入技能"
      />
    );
    
    // 確保組件正確渲染，沒有崩潰
    expect(screen.getByPlaceholderText('輸入技能')).toBeInTheDocument();
  });
}); 