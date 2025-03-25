import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../context/FormContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faInfoCircle, faEdit, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

const PromptEditor: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateGenerationSettings, getPromptTemplatesList, addPromptTemplate, updatePromptTemplate, deletePromptTemplate, setActivePromptId } = useFormContext();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 從 FormContext 加載模板
  useEffect(() => {
    // 使用新的方法獲取模板列表
    const contextTemplates = getPromptTemplatesList();
    
    setTemplates(contextTemplates);
    
    // 設置當前選中的模板
    const selectedTemplateId = formData.generationSettings.activePromptId;
    const selectedTemplate = contextTemplates.find(t => t.id === selectedTemplateId);
    
    if (selectedTemplate) {
      setCurrentTemplate(selectedTemplate);
    } else if (contextTemplates.length > 0) {
      setCurrentTemplate(contextTemplates[0]);
    }
  }, [formData.generationSettings, getPromptTemplatesList]);

  // 保存更新後的模板
  const saveTemplates = (updatedTemplates: PromptTemplate[]) => {
    setTemplates(updatedTemplates);
    
    // 已經不需要顯式保存，因為各個方法會自動保存
    
    // 顯示成功提示
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(false);
  };

  const handleCreateTemplate = () => {
    const newTemplate: Omit<PromptTemplate, 'id'> = {
      name: '新模板',
      description: '請添加描述',
      content: '請根據以下信息生成一份專業的自我介紹，時間約為{duration}秒，語言為{language}，風格為{style}，重點突出{keywords}。自我介紹應包含個人背景、教育經歷、專業技能和工作經驗，特別強調與{industry}行業和{job_position}職位相關的能力和經驗。'
    };
    
    // 使用新的方法添加模板
    const newId = addPromptTemplate(newTemplate);
    
    // 重新獲取模板列表
    const updatedTemplates = getPromptTemplatesList();
    setTemplates(updatedTemplates);
    
    // 設置新創建的模板為當前模板
    const createdTemplate = updatedTemplates.find(t => t.id === newId);
    if (createdTemplate) {
      setCurrentTemplate(createdTemplate);
      setIsEditing(true);
    }
  };

  const handleUpdateTemplate = () => {
    if (!currentTemplate) return;
    
    // 使用新的方法更新模板
    updatePromptTemplate(currentTemplate.id, {
      name: currentTemplate.name,
      description: currentTemplate.description,
      content: currentTemplate.content
    });
    
    // 重新獲取模板列表
    const updatedTemplates = getPromptTemplatesList();
    setTemplates(updatedTemplates);
    
    // 如果更新的是當前選中的模板，同時更新 activePromptId
    if (currentTemplate.id === formData.generationSettings.activePromptId) {
      // 這部分在 updatePromptTemplate 方法中已經處理了
      setActivePromptId(currentTemplate.id);
    }
    
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    // 確認刪除
    if (!window.confirm('確定要刪除這個模板嗎？此操作無法撤銷。')) {
      return;
    }
    
    // 使用新的方法刪除模板
    deletePromptTemplate(id);
    
    // 重新獲取模板列表
    const updatedTemplates = getPromptTemplatesList();
    setTemplates(updatedTemplates);
    
    // 如果刪除的是當前選中的模板，則選中第一個模板
    if (currentTemplate?.id === id) {
      if (updatedTemplates.length > 0) {
        setCurrentTemplate(updatedTemplates[0]);
      } else {
        setCurrentTemplate(null);
      }
    }
    
    setIsEditing(false);
  };

  const handleUseTemplate = () => {
    if (!currentTemplate) return;
    
    // 使用新的方法設置當前模板
    setActivePromptId(currentTemplate.id);
    
    // 顯示成功提示
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBackToSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={handleBackToSettings}
            className="text-gray-600 hover:text-indigo-600 flex items-center mb-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            返回設定頁面
          </button>
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">提示詞編輯器</h1>
          <p className="text-gray-600">創建和管理自定義提示詞模板，提升自我介紹的品質</p>
        </div>
        
        {saveSuccess && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md flex items-center">
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            已成功保存更改
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Template List */}
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">提示詞模板</h2>
            <button 
              onClick={handleCreateTemplate}
              className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-1" /> 新增
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {templates.map(template => (
              <div 
                key={template.id} 
                className={`p-3 rounded-md cursor-pointer flex justify-between items-center ${currentTemplate?.id === template.id ? 'bg-indigo-100 border-l-4 border-indigo-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => handleSelectTemplate(template)}
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </div>
                {templates.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
          {currentTemplate ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {isEditing ? '編輯模板' : '模板詳情'}
                </h2>
                <div className="space-x-2">
                  {isEditing ? (
                    <button 
                      onClick={handleUpdateTemplate}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-1" /> 儲存
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> 編輯
                      </button>
                      <button 
                        onClick={handleUseTemplate}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-1" /> 套用
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模板名稱</label>
                  <input
                    type="text"
                    value={currentTemplate.name}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                  <input
                    type="text"
                    value={currentTemplate.description}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">提示詞模板</label>
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <FontAwesomeIcon icon={faInfoCircle} /> 變數說明
                    </button>
                  </div>
                  <textarea
                    value={currentTemplate.content}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, content: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md h-64 font-mono"
                    disabled={!isEditing}
                  />
                </div>

                {showHelp && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h3 className="font-medium text-blue-800 mb-2">可用變數</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <span className="text-blue-700"><code>{'{name}'}</code> - 姓名</span>
                      <span className="text-blue-700"><code>{'{age}'}</code> - 年齡</span>
                      <span className="text-blue-700"><code>{'{location}'}</code> - 所在地</span>
                      <span className="text-blue-700"><code>{'{education}'}</code> - 教育背景</span>
                      <span className="text-blue-700"><code>{'{skills}'}</code> - 技能專長</span>
                      <span className="text-blue-700"><code>{'{experience}'}</code> - 工作經驗</span>
                      <span className="text-blue-700"><code>{'{industry}'}</code> - 目標行業</span>
                      <span className="text-blue-700"><code>{'{job_position}'}</code> - 應徵職位</span>
                      <span className="text-blue-700"><code>{'{language}'}</code> - 語言</span>
                      <span className="text-blue-700"><code>{'{tone}'}</code> - 語調</span>
                      <span className="text-blue-700"><code>{'{length}'}</code> - 長度</span>
                      <span className="text-blue-700"><code>{'{duration}'}</code> - 時間長度</span>
                      <span className="text-blue-700"><code>{'{keywords}'}</code> - 關鍵詞</span>
                      <span className="text-blue-700"><code>{'{focus_areas}'}</code> - 重點領域</span>
                      <span className="text-blue-700"><code>{'{target_audience}'}</code> - 目標讀者</span>
                      <span className="text-blue-700"><code>{'{style}'}</code> - 風格</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">請選擇或創建一個模板</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptEditor; 