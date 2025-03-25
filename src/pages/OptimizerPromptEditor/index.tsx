import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSave, 
  faTimes, 
  faInfoCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { useOptimizerPrompt, OptimizerPromptTemplate } from '../../context/OptimizerPromptContext';

const OptimizerPromptEditor: React.FC = () => {
  const { 
    analysisTemplates, 
    currentTemplate, 
    setCurrentTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    useCustomPrompt,
    setUseCustomPrompt
  } = useOptimizerPrompt();

  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<OptimizerPromptTemplate> | null>(null);
  const [showVariables, setShowVariables] = useState(false);

  // Initialize editing template when starting edit mode
  const handleStartEdit = () => {
    console.log('Starting edit mode');
    if (!currentTemplate) {
      console.log('No currentTemplate found, returning');
      return;
    }
    
    console.log('Setting up editingTemplate with:', currentTemplate);
    setEditingTemplate({
      id: currentTemplate.id,
      name: currentTemplate.name,
      description: currentTemplate.description,
      analysisTemplate: currentTemplate.analysisTemplate,
      guidanceTemplate: currentTemplate.guidanceTemplate,
      isDefault: currentTemplate.isDefault
    });
    
    setIsEditing(true);
    console.log('Edit mode started');
  };
  
  // Define the interface for template item props
  interface TemplateItemProps {
    template: OptimizerPromptTemplate & { isNew?: boolean };
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }

  // Return a new template with a different appearance
  const TemplateItem: React.FC<TemplateItemProps> = ({ template, isSelected, onSelect, onEdit, onDelete }) => (
  <div 
    className={`p-3 rounded-md cursor-pointer transition ${
      isSelected 
        ? 'bg-purple-100 border-l-4 border-purple-500' 
        : 'bg-gray-50 hover:bg-gray-100'
    }`}
    onClick={onSelect}
  >
    <div className="flex justify-between items-center">
      <h3 className="font-medium">{template.name}</h3>
      {isSelected && !template.isDefault && (
        <div className="flex space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-blue-600 hover:text-blue-800"
            title="編輯模板"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 hover:text-red-800"
            title="刪除模板"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      )}
    </div>
    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
    {template.isDefault && (
      <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
        預設模板
      </span>
    )}
    {template.isNew && (
      <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
        新增模板
      </span>
    )}
  </div>
);

  // Handle creating a new template
  const handleCreateTemplate = () => {
    console.log('Create template button clicked');
    
    // Generate a unique name
    let baseName = '新模板';
    let counter = 1;
    let templateName = baseName;
    
    // Check if name already exists and generate a unique one
    while (analysisTemplates.some(t => t.name === templateName)) {
      templateName = `${baseName} ${counter}`;
      counter++;
    }
    
    // Create a new template immediately
    const newTemplate = {
      name: templateName,
      description: '自定義模板',
      analysisTemplate: currentTemplate?.analysisTemplate || '',
      guidanceTemplate: currentTemplate?.guidanceTemplate || '',
      isDefault: false
    };
    
    // Add the template to the list and get the new ID
    const newTemplateId = addTemplate(newTemplate);
    
    // Set up editing for the new template
    setEditingTemplate({
      id: newTemplateId,
      ...newTemplate
    });
    
    setIsEditing(true);
    console.log('New template created with ID:', newTemplateId);
  };
  
  // Handle saving template changes
  const handleSaveTemplate = () => {
    console.log('Save template button clicked');
    if (!editingTemplate) {
      console.log('No editingTemplate found, returning');
      return;
    }
    
    // Ensure the name is unique
    let finalName = editingTemplate.name || '新模板';
    let counter = 1;
    let uniqueName = finalName;
    let nameWasChanged = false;
    
    // Check if name already exists (except for the current template)
    while (analysisTemplates.some(t => t.name === uniqueName && t.id !== editingTemplate.id)) {
      uniqueName = `${finalName} ${counter}`;
      counter++;
      nameWasChanged = true;
    }
    
    const updatedTemplate = {
      ...editingTemplate,
      name: uniqueName
    };
    
    console.log('Current state before save:', { isEditing, currentTemplate, editingTemplate: updatedTemplate });
    
    if (editingTemplate.id) {
      console.log('Updating existing template:', editingTemplate.id);
      // Update existing template
      updateTemplate(editingTemplate.id, updatedTemplate);
    } else {
      console.log('Creating new template');
      // Create new template
      addTemplate({
        name: updatedTemplate.name,
        description: updatedTemplate.description || '自定義模板',
        analysisTemplate: updatedTemplate.analysisTemplate || '',
        guidanceTemplate: updatedTemplate.guidanceTemplate || '',
        isDefault: false
      });
    }
    
    // Show message if name was automatically changed
    if (nameWasChanged) {
      setTimeout(() => {
        alert(`為避免名稱重複，模板名稱已自動更改為「${uniqueName}」`);
      }, 100);
    }
    
    console.log('Resetting editor state');
    setIsEditing(false);
    setEditingTemplate(null);
  };
  
  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('確定要刪除此模板嗎？此操作無法復原。')) {
      deleteTemplate(id);
    }
  };
  
  // Handle input changes for the template being edited
  const handleEditChange = (field: keyof OptimizerPromptTemplate, value: string) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      [field]: value
    });
  };
  
  // Apply the current template to the optimizer
  const handleApplyTemplate = () => {
    if (!currentTemplate) return;
    
    setUseCustomPrompt(true);
    alert('模板已套用！您的自我介紹優化將使用此自定義模板。');
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    // If editing and there are changes, ask for confirmation
    if (isEditing && editingTemplate) {
      if (window.confirm('您有未儲存的變更，確定要離開嗎？')) {
        setCurrentTemplate(templateId);
        setIsEditing(false);
        setEditingTemplate(null);
      }
    } else {
      setCurrentTemplate(templateId);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Link to="/optimizer" className="mr-4 text-gray-600 hover:text-gray-800">
          <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
        </Link>
        <h1 className="text-3xl font-bold text-purple-600 mb-0">優化提示詞編輯器</h1>
      </div>
      <p className="text-gray-600 mb-8">
        創建和管理自定義提示詞模板，提升自我介紹優化分析和指導的品質
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Template List */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">提示詞模板</h2>
            <button 
              onClick={handleCreateTemplate}
              className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" /> 新增
            </button>
          </div>
          
          <div className="space-y-2">
            {analysisTemplates.map(template => (
              <TemplateItem 
                key={template.id}
                template={{...template, isNew: editingTemplate?.id === template.id && isEditing}}
                isSelected={currentTemplate?.id === template.id}
                onSelect={() => handleTemplateSelect(template.id)}
                onEdit={handleStartEdit}
                onDelete={() => handleDeleteTemplate(template.id)}
              />
            ))}
            
            {analysisTemplates.length === 0 && (
              <div className="p-4 bg-gray-50 text-center rounded-md">
                <p className="text-gray-500">沒有可用的提示詞模板</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Template Editor */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
          {isEditing ? (
            // Edit Mode
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-6">
                  {editingTemplate?.id ? '編輯模板' : '新增模板'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">模板名稱</label>
                    <input
                      type="text"
                      value={editingTemplate?.name || ''}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="輸入模板名稱"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">描述</label>
                    <input
                      type="text"
                      value={editingTemplate?.description || ''}
                      onChange={(e) => handleEditChange('description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="輸入模板描述"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block font-medium text-gray-700">分析提示詞</label>
                      <button
                        onClick={() => setShowVariables(!showVariables)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        {showVariables ? '隱藏變數說明' : '顯示變數說明'}
                      </button>
                    </div>
                    <textarea
                      value={editingTemplate?.analysisTemplate || ''}
                      onChange={(e) => handleEditChange('analysisTemplate', e.target.value)}
                      className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono"
                      placeholder="輸入分析提示詞模板..."
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">指導提示詞</label>
                    <textarea
                      value={editingTemplate?.guidanceTemplate || ''}
                      onChange={(e) => handleEditChange('guidanceTemplate', e.target.value)}
                      className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono"
                      placeholder="輸入指導提示詞模板..."
                    />
                  </div>
                </div>
                
                {showVariables && (
                  <div className="bg-blue-50 p-4 rounded-md mt-4">
                    <h3 className="font-medium mb-2 text-blue-800">可用變數列表</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-mono text-blue-600">{'{transcript}'}</span> - 語音轉錄文本</div>
                      <div><span className="font-mono text-blue-600">{'{evaluation_areas}'}</span> - 評估領域</div>
                      <div><span className="font-mono text-blue-600">{'{speech_rate}'}</span> - 語速評分</div>
                      <div><span className="font-mono text-blue-600">{'{clarity}'}</span> - 清晰度評分</div>
                      <div><span className="font-mono text-blue-600">{'{confidence}'}</span> - 自信度評分</div>
                      <div><span className="font-mono text-blue-600">{'{improvements}'}</span> - 改進建議</div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-1" />
                    取消
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-1" />
                    儲存
                  </button>
                </div>
              </div>
            </>
          ) : (
            // View Mode
            <>
              {currentTemplate ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{currentTemplate.name}</h2>
                    <div className="flex space-x-3">
                      {!currentTemplate.isDefault && (
                        <button
                          onClick={handleStartEdit}
                          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          編輯
                        </button>
                      )}
                      <button
                        onClick={handleApplyTemplate}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        disabled={useCustomPrompt}
                      >
                        {useCustomPrompt 
                          ? '已套用' 
                          : '套用此模板'}
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{currentTemplate.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">分析提示詞</h3>
                    <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
                      {currentTemplate.analysisTemplate}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">指導提示詞</h3>
                    <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
                      {currentTemplate.guidanceTemplate}
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                      <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          這些提示詞將被用來生成自我介紹的優化分析和指導建議。變更提示詞可以調整分析的重點和輸出格式。
                        </p>
                        <p className="text-sm text-yellow-800 mt-2">
                          您可以使用 {'{'} 變數名稱 {'}'} 來插入動態內容，例如轉錄文本、評估分數等。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">請選擇或建立一個提示詞模板</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizerPromptEditor; 