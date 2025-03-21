import React, { useState, useEffect } from 'react';
import { useFormContext } from '../../context/FormContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faPlus, faTrash, faInfoCircle, faEdit } from '@fortawesome/free-solid-svg-icons';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  isDefault: boolean;
}

const PromptEditor: React.FC = () => {
  const { formData, updateGenerationSettings } = useFormContext();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('promptTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Create default template if none exist
      const defaultTemplate: PromptTemplate = {
        id: '1',
        name: '基本模板',
        description: '基本的自我介紹生成模板',
        template: '請根據以下信息生成一份專業的自我介紹，時間約為{duration}秒，語言為{language}，風格為{style}，重點突出{keywords}。自我介紹應包含個人背景、教育經歷、專業技能和工作經驗，特別強調與{industry}行業和{job_position}職位相關的能力和經驗。',
        isDefault: true
      };
      setTemplates([defaultTemplate]);
      localStorage.setItem('promptTemplates', JSON.stringify([defaultTemplate]));
    }
  }, []);

  // If no current template is selected, select the first one
  useEffect(() => {
    if (templates.length > 0 && !currentTemplate) {
      setCurrentTemplate(templates[0]);
    }
  }, [templates, currentTemplate]);

  const saveTemplates = (updatedTemplates: PromptTemplate[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem('promptTemplates', JSON.stringify(updatedTemplates));
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(false);
  };

  const handleCreateTemplate = () => {
    const newTemplate: PromptTemplate = {
      id: Date.now().toString(),
      name: '新模板',
      description: '請添加描述',
      template: '請輸入提示詞模板',
      isDefault: false
    };
    
    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    setCurrentTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleUpdateTemplate = () => {
    if (!currentTemplate) return;
    
    const updatedTemplates = templates.map(template => 
      template.id === currentTemplate.id ? currentTemplate : template
    );
    
    saveTemplates(updatedTemplates);
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    // Don't allow deleting the default template
    if (templates.find(t => t.id === id)?.isDefault) {
      return;
    }
    
    const updatedTemplates = templates.filter(template => template.id !== id);
    saveTemplates(updatedTemplates);
    
    // If the deleted template was the current one, select the first template
    if (currentTemplate?.id === id) {
      setCurrentTemplate(updatedTemplates[0]);
      setIsEditing(false);
    }
  };

  const handleUseTemplate = () => {
    if (!currentTemplate) return;
    
    updateGenerationSettings({
      promptTemplate: currentTemplate.template,
      useCustomPrompt: true
    });
    
    // Show success message
    alert('模板已套用！請前往生成設定頁查看。');
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-indigo-600 mb-2">提示詞編輯器</h1>
      <p className="text-gray-600 mb-8">創建和管理自定義提示詞模板，提升自我介紹的品質</p>

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
                {!template.isDefault && (
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
                        disabled={currentTemplate.isDefault}
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
                    disabled={!isEditing || currentTemplate.isDefault}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                  <input
                    type="text"
                    value={currentTemplate.description}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!isEditing || currentTemplate.isDefault}
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
                    value={currentTemplate.template}
                    onChange={(e) => isEditing && setCurrentTemplate({...currentTemplate, template: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md h-64 font-mono"
                    disabled={!isEditing || currentTemplate.isDefault}
                  />
                </div>

                {showHelp && (
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2 text-indigo-800">可用變數列表</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-mono text-indigo-600">{'{name}'}</span> - 姓名</div>
                      <div><span className="font-mono text-indigo-600">{'{age}'}</span> - 年齡</div>
                      <div><span className="font-mono text-indigo-600">{'{education}'}</span> - 教育經歷</div>
                      <div><span className="font-mono text-indigo-600">{'{work_experience}'}</span> - 工作經驗</div>
                      <div><span className="font-mono text-indigo-600">{'{skills}'}</span> - 專業技能</div>
                      <div><span className="font-mono text-indigo-600">{'{projects}'}</span> - 項目經歷</div>
                      <div><span className="font-mono text-indigo-600">{'{awards}'}</span> - 獲獎記錄</div>
                      <div><span className="font-mono text-indigo-600">{'{interests}'}</span> - 興趣愛好</div>
                      <div><span className="font-mono text-indigo-600">{'{industry}'}</span> - 應徵產業</div>
                      <div><span className="font-mono text-indigo-600">{'{job_position}'}</span> - 應徵職位</div>
                      <div><span className="font-mono text-indigo-600">{'{keywords}'}</span> - 關鍵詞</div>
                      <div><span className="font-mono text-indigo-600">{'{duration}'}</span> - 時間長度</div>
                      <div><span className="font-mono text-indigo-600">{'{language}'}</span> - 語言</div>
                      <div><span className="font-mono text-indigo-600">{'{style}'}</span> - 風格</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              請從左側選擇一個模板或者新增模板
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptEditor; 