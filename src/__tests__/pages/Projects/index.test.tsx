import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Projects from '../../../pages/Projects';
import { FormProvider } from '../../../context/FormContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// 模擬 window.confirm
window.confirm = jest.fn(() => true);

describe('Projects 頁面', () => {
  const mockProjects = [
    { id: '1', title: '測試專案 1', timestamp: Date.now() - 86400000, status: 'draft', lastEdited: '2023/01/01', description: '自我介紹專案' },
    { id: '2', title: '測試專案 2', timestamp: Date.now(), status: 'completed', lastEdited: '2023/01/02', description: '自我介紹專案' },
  ];

  beforeEach(() => {
    // 模擬 localStorage
    const localStorageMock = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'projects') {
          return JSON.stringify(mockProjects);
        }
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/projects']}>
        <FormProvider>
          <Routes>
            <Route path="/projects" element={<Projects />} />
          </Routes>
        </FormProvider>
      </MemoryRouter>
    );
  };

  test('渲染專案列表', () => {
    renderWithRouter();
    
    // 檢查標題是否正確顯示
    expect(screen.getByText('我的專案')).toBeInTheDocument();
    
    // 檢查專案是否顯示
    expect(screen.getByText('測試專案 1')).toBeInTheDocument();
    expect(screen.getByText('測試專案 2')).toBeInTheDocument();
  });

  test('創建新專案', () => {
    renderWithRouter();
    
    // 找到並點擊「新增專案」按鈕
    const createButton = screen.getByText('新增專案');
    fireEvent.click(createButton);
    
    // 檢查 localStorage.setItem 是否被調用（因為點擊按鈕會直接創建新專案）
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  test('刪除專案', () => {
    renderWithRouter();
    
    // 找到並點擊刪除按鈕
    const deleteButtons = screen.getAllByText('刪除');
    fireEvent.click(deleteButtons[0]);
    
    // 確認 window.confirm 被呼叫
    expect(window.confirm).toHaveBeenCalledWith('確定要刪除此專案嗎？此操作無法撤銷。');
    
    // 檢查 localStorage.setItem 是否被調用
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  test('空專案列表顯示', () => {
    // 改變 localStorage 模擬返回空專案列表
    jest.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify([]));
    
    renderWithRouter();
    
    // 檢查空列表提示
    expect(screen.getByText('尚無專案')).toBeInTheDocument();
    
    // 檢查創建專案按鈕存在
    expect(screen.getByText('創建專案')).toBeInTheDocument();
  });

  test('顯示生成歷史按鈕', () => {
    renderWithRouter();
    
    // 檢查導航欄中的生成歷史按鈕
    expect(screen.getByText('生成歷史')).toBeInTheDocument();
  });
}); 