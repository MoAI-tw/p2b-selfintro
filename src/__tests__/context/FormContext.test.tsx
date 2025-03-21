import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useFormContext } from '../../context/FormContext';

// 測試組件，用於訪問 FormContext
const TestComponent = () => {
  const { 
    formData, 
    updatePersonalInfo, 
    addEducation, 
    removeEducation, 
    addSkill, 
    removeSkill, 
    addGenerationRecord,
    getGenerationRecords 
  } = useFormContext();

  return (
    <div>
      <div data-testid="name">{formData.personalInfo.name}</div>
      <div data-testid="education-count">{formData.personalInfo.education.length}</div>
      <div data-testid="skills-count">{formData.personalInfo.skills.length}</div>
      <div data-testid="records-count">{getGenerationRecords().length}</div>
      
      <button onClick={() => updatePersonalInfo({ name: 'Test Name' })}>Update Name</button>
      <button onClick={addEducation}>Add Education</button>
      <button onClick={() => removeEducation(0)}>Remove Education</button>
      <button onClick={addSkill}>Add Skill</button>
      <button onClick={() => removeSkill(0)}>Remove Skill</button>
      <button onClick={() => addGenerationRecord({
        projectId: '123',
        projectTitle: 'Test Project',
        formData: formData,
        generatedText: 'Test generated text',
        modelProvider: 'openai',
        modelId: 'gpt-3.5-turbo',
        estimatedTokens: 100,
        estimatedCost: 0.002,
        promptTemplate: 'Test template',
        actualPrompt: 'Test prompt'
      })}>Add Record</button>
    </div>
  );
};

describe('FormContext', () => {
  test('初始化時有默認值', () => {
    render(
      <FormProvider>
        <TestComponent />
      </FormProvider>
    );
    
    expect(screen.getByTestId('name').textContent).toBe('');
    expect(screen.getByTestId('education-count').textContent).toBe('1');
    expect(screen.getByTestId('skills-count').textContent).toBe('1');
    expect(screen.getByTestId('records-count').textContent).toBe('0');
  });

  test('可以更新個人資訊', () => {
    render(
      <FormProvider>
        <TestComponent />
      </FormProvider>
    );
    
    fireEvent.click(screen.getByText('Update Name'));
    expect(screen.getByTestId('name').textContent).toBe('Test Name');
  });

  test('可以添加和刪除教育經歷', () => {
    render(
      <FormProvider>
        <TestComponent />
      </FormProvider>
    );
    
    expect(screen.getByTestId('education-count').textContent).toBe('1');
    fireEvent.click(screen.getByText('Add Education'));
    expect(screen.getByTestId('education-count').textContent).toBe('2');
    fireEvent.click(screen.getByText('Remove Education'));
    expect(screen.getByTestId('education-count').textContent).toBe('1');
  });

  test('可以添加和刪除技能', () => {
    render(
      <FormProvider>
        <TestComponent />
      </FormProvider>
    );
    
    expect(screen.getByTestId('skills-count').textContent).toBe('1');
    fireEvent.click(screen.getByText('Add Skill'));
    expect(screen.getByTestId('skills-count').textContent).toBe('2');
    fireEvent.click(screen.getByText('Remove Skill'));
    expect(screen.getByTestId('skills-count').textContent).toBe('1');
  });
  
  test('可以添加生成記錄', () => {
    render(
      <FormProvider>
        <TestComponent />
      </FormProvider>
    );
    
    expect(screen.getByTestId('records-count').textContent).toBe('0');
    fireEvent.click(screen.getByText('Add Record'));
    expect(screen.getByTestId('records-count').textContent).toBe('1');
  });
}); 