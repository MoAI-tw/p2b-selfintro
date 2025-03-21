import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCalculator } from '@fortawesome/free-solid-svg-icons';
import { useApiKey } from '../context/ApiKeyContext';

interface CostEstimatorProps {
  estimatedTokens?: number;
  className?: string;
}

/**
 * 計算指定模型和標記數量的預估成本
 */
const calculateCost = (modelId: string, costPer1kTokens: number, estimatedTokens: number): number => {
  // 針對特殊定價模型進行成本計算
  if (modelId === 'gemini-1.5-pro') {
    // Gemini 1.5 Pro 有階梯式定價
    if (estimatedTokens < 128000) {
      // 少於 128k 符記：$1.25 / 1M tokens
      return (costPer1kTokens * estimatedTokens) / 1000;
    } else {
      // 超過 128k 符記：$5 / 1M tokens
      return (5 * estimatedTokens) / 1000000;
    }
  } else if (modelId.startsWith('gemini-2.0') || modelId.startsWith('gemini-1.5-flash')) {
    // Gemini 2.0 和 1.5 Flash 系列模型按百萬標記計費，需要轉換
    return (costPer1kTokens * estimatedTokens) / 1000;
  } else {
    // 一般模型按照每1K標記計費
    return (costPer1kTokens * estimatedTokens) / 1000;
  }
};

const CostEstimator: React.FC<CostEstimatorProps> = ({ 
  estimatedTokens = 1000, 
  className = '' 
}) => {
  const { selectedModel } = useApiKey();
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [priceString, setPriceString] = useState<string>('');
  
  useEffect(() => {
    // 計算預估成本
    if (selectedModel.costPer1kTokens) {
      const cost = calculateCost(
        selectedModel.id, 
        selectedModel.costPer1kTokens, 
        estimatedTokens
      );
      setEstimatedCost(cost);
      
      // 根據模型生成價格字符串
      let pricing = '';
      if (selectedModel.id === 'gemini-1.5-pro') {
        pricing = '少於 128k tokens: $1.25/1M tokens; 超過 128k tokens: $5/1M tokens';
      } else if (selectedModel.id.startsWith('gemini-2.0')) {
        pricing = `$${selectedModel.costPer1kTokens}/1K tokens (相當於 $${selectedModel.costPer1kTokens * 1000}/1M tokens)`;
      } else {
        pricing = `$${selectedModel.costPer1kTokens}/1K tokens`;
      }
      setPriceString(pricing);
    } else {
      setEstimatedCost(0);
      setPriceString('未知定價');
    }
  }, [selectedModel, estimatedTokens]);
  
  // 只在有成本資訊時顯示
  if (!selectedModel.costPer1kTokens) {
    return null;
  }
  
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start">
        <FontAwesomeIcon icon={faCalculator} className="text-blue-500 mt-1 mr-2" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">預估 API 呼叫成本</h3>
          <div className="mt-1">
            <div className="flex justify-between">
              <p className="text-sm text-blue-700">使用模型:</p>
              <p className="text-sm font-medium text-blue-700">{selectedModel.name}</p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm text-blue-700">定價:</p>
              <p className="text-sm font-medium text-blue-700">{priceString}</p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm text-blue-700">預估標記數:</p>
              <p className="text-sm font-medium text-blue-700">{estimatedTokens} tokens</p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm text-blue-700">預估單次生成成本:</p>
              <p className="text-sm font-medium text-blue-700">${estimatedCost.toFixed(6)} {selectedModel.currency}</p>
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              實際成本取決於輸入和輸出標記的總數，此處僅為估算參考
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimator; 