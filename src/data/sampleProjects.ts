interface SampleProject {
  id: string;
  title: string;
  status: string;
  lastEdited: string;
  description: string;
  formData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      education: string[];
      workExperience: {
        title: string;
        company: string;
        period: string;
        description: string;
      }[];
      skills: string[];
      interests: string[];
      additionalInfo?: string;
    };
    industrySettings: {
      jobCategory: string;
      jobSubcategory: string;
      specificPosition?: string;
      keywords: string[];
      focusAreas?: string[];
    };
    generationSettings: {
      tone: string;
      outputLength: string;
      language: string;
      highlightStrengths: boolean;
      includeCallToAction: boolean;
      focusOnRecentExperience: boolean;
    };
  };
}

export const sampleProjects: SampleProject[] = [
  // 軟體工程師範例
  {
    id: "sample-software-engineer",
    title: "軟體工程師自我介紹範例",
    status: "completed",
    lastEdited: new Date().toISOString().slice(0, 7),
    description: "前端開發工程師的自我介紹專案",
    formData: {
      personalInfo: {
        name: "林志豪",
        email: "example@mail.com",
        phone: "0912-345-678",
        location: "台北市",
        education: [
          "國立台灣大學 資訊工程學系 學士 (2016-2020)",
          "國立台灣大學 資訊工程研究所 碩士 (2020-2022)"
        ],
        workExperience: [
          {
            title: "前端工程師",
            company: "科技新創公司",
            period: "2022-07 - 至今",
            description: "負責公司主要產品的前端開發，使用React、TypeScript和TailwindCSS技術堆疊，實作響應式設計並優化網站性能，將網站載入時間減少30%。參與SCRUM敏捷開發流程，與後端工程師緊密合作。"
          },
          {
            title: "前端開發實習生",
            company: "大型科技公司",
            period: "2021-07 - 2022-01",
            description: "參與企業內部管理系統的前端開發，使用Vue.js框架進行開發，協助團隊實現新功能並修復錯誤。"
          }
        ],
        skills: [
          "JavaScript/TypeScript", 
          "React.js", 
          "Vue.js", 
          "HTML5/CSS3", 
          "TailwindCSS", 
          "RESTful API", 
          "Git版本控制", 
          "前端效能優化"
        ],
        interests: ["網頁技術探索", "開源專案貢獻", "系統架構設計", "UI/UX設計"]
      },
      industrySettings: {
        jobCategory: "it",
        jobSubcategory: "web_dev",
        specificPosition: "資深前端工程師",
        keywords: ["前端開發", "React", "TypeScript", "使用者體驗", "團隊合作", "問題解決", "持續學習"],
        focusAreas: ["skills", "experience", "achievements"]
      },
      generationSettings: {
        tone: "Professional",
        outputLength: "Medium",
        language: "Chinese",
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      }
    }
  },
  
  // 金融分析師範例
  {
    id: "sample-financial-analyst",
    title: "金融分析師自我介紹範例",
    status: "completed",
    lastEdited: new Date().toISOString().slice(0, 7),
    description: "金融業專業人士的自我介紹專案",
    formData: {
      personalInfo: {
        name: "王美琪",
        email: "example@mail.com",
        phone: "0923-456-789",
        location: "台北市",
        education: [
          "國立政治大學 財務金融學系 學士 (2015-2019)",
          "國立臺灣大學 財務金融研究所 碩士 (2019-2021)"
        ],
        workExperience: [
          {
            title: "財務分析師",
            company: "大型跨國銀行",
            period: "2021-09 - 至今",
            description: "負責分析上市公司財務報表、產業趨勢及市場風險，提供投資建議和報告。協助客戶管理投資組合，年度績效超過大盤5%。使用Bloomberg、Reuters等工具進行數據分析。"
          },
          {
            title: "財務部實習生",
            company: "大型證券公司",
            period: "2020-07 - 2021-01",
            description: "協助資深分析師收集和整理市場數據，參與財務報告撰寫，學習使用專業金融工具進行數據分析。"
          }
        ],
        skills: [
          "財務分析", 
          "風險評估", 
          "投資組合管理", 
          "財務報表分析", 
          "Excel高級技能", 
          "金融建模",
          "資產配置",
          "PYTHON數據分析"
        ],
        interests: ["總體經濟研究", "ESG投資", "金融科技", "區塊鏈技術"]
      },
      industrySettings: {
        jobCategory: "finance",
        jobSubcategory: "financial_analyst",
        specificPosition: "高級財務分析師",
        keywords: ["財務分析", "投資組合管理", "風險評估", "數據分析", "精確性", "商業敏銳度", "溝通能力"],
        focusAreas: ["skills", "experience", "achievements"]
      },
      generationSettings: {
        tone: "Formal",
        outputLength: "Medium",
        language: "Chinese",
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      }
    }
  },
  
  // 行銷專員範例
  {
    id: "sample-marketing-specialist",
    title: "行銷專員自我介紹範例",
    status: "completed",
    lastEdited: new Date().toISOString().slice(0, 7),
    description: "數位行銷專業人員的自我介紹專案",
    formData: {
      personalInfo: {
        name: "陳怡君",
        email: "example@mail.com",
        phone: "0934-567-890",
        location: "台北市",
        education: [
          "國立台灣師範大學 大眾傳播學系 學士 (2017-2021)"
        ],
        workExperience: [
          {
            title: "數位行銷專員",
            company: "電子商務公司",
            period: "2021-08 - 至今",
            description: "負責策劃和執行社群媒體行銷活動，管理公司的Facebook、Instagram與LINE官方帳號。透過數據分析調整行銷策略，將轉換率提高20%，社群用戶互動增加35%。協調跨部門合作，確保行銷訊息的一致性。"
          },
          {
            title: "行銷實習生",
            company: "知名品牌代理商",
            period: "2020-07 - 2021-01",
            description: "協助市場調查和競品分析，參與品牌行銷活動的執行，學習使用Google Analytics、Facebook Business等工具追蹤行銷效果。"
          }
        ],
        skills: [
          "社群媒體行銷", 
          "內容策劃", 
          "數位廣告投放", 
          "GA分析", 
          "SEO優化", 
          "活動企劃",
          "消費者行為分析",
          "簡報製作"
        ],
        interests: ["新媒體趨勢", "消費者心理學", "視覺設計", "品牌策略"]
      },
      industrySettings: {
        jobCategory: "marketing",
        jobSubcategory: "marketing_specialist",
        specificPosition: "資深數位行銷專員",
        keywords: ["數位行銷", "社群媒體管理", "內容行銷", "數據分析", "創意思考", "團隊協作", "溝通表達"],
        focusAreas: ["experience", "skills", "personality"]
      },
      generationSettings: {
        tone: "Creative",
        outputLength: "Medium",
        language: "Chinese",
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      }
    }
  },
  
  // 人力資源專員範例
  {
    id: "sample-hr-specialist",
    title: "人資專員自我介紹範例",
    status: "completed",
    lastEdited: new Date().toISOString().slice(0, 7),
    description: "人力資源管理專業人員的自我介紹專案",
    formData: {
      personalInfo: {
        name: "張家豪",
        email: "example@mail.com",
        phone: "0945-678-901",
        location: "台中市",
        education: [
          "國立中興大學 企業管理學系 學士 (2015-2019)",
          "國立政治大學 人力資源管理研究所 碩士 (2019-2021)"
        ],
        workExperience: [
          {
            title: "人力資源專員",
            company: "大型製造企業",
            period: "2021-07 - 至今",
            description: "負責員工招募、培訓與績效管理，每年完成約100名員工的招聘流程。設計並實施員工發展計劃，提高員工留任率15%。協助管理公司福利制度並處理勞資關係事宜。"
          },
          {
            title: "人資部實習生",
            company: "跨國企業台灣分公司",
            period: "2020-01 - 2020-07",
            description: "協助招募流程，包括履歷篩選、面試安排及候選人溝通。參與員工教育訓練活動的規劃與執行，學習人力資源管理系統的操作。"
          }
        ],
        skills: [
          "人才招募與甄選", 
          "績效管理", 
          "勞資關係處理", 
          "教育訓練規劃", 
          "員工關係管理", 
          "薪資福利制度",
          "人力資源政策制定",
          "勞動法規"
        ],
        interests: ["組織發展", "職場心理學", "人才管理創新", "多元包容職場"]
      },
      industrySettings: {
        jobCategory: "management",
        jobSubcategory: "human_resource_staff",
        specificPosition: "資深人力資源專員",
        keywords: ["人才招募", "員工關係", "績效管理", "培訓發展", "溝通協調", "問題解決", "同理心"],
        focusAreas: ["experience", "skills", "personality"]
      },
      generationSettings: {
        tone: "Friendly",
        outputLength: "Medium",
        language: "Chinese",
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      }
    }
  },
  
  // UI/UX設計師範例
  {
    id: "sample-uiux-designer",
    title: "UI/UX設計師自我介紹範例",
    status: "completed",
    lastEdited: new Date().toISOString().slice(0, 7),
    description: "使用者介面設計專業人員的自我介紹專案",
    formData: {
      personalInfo: {
        name: "李韻如",
        email: "example@mail.com",
        phone: "0956-789-012",
        location: "台北市",
        education: [
          "國立台灣藝術大學 視覺傳達設計學系 學士 (2016-2020)"
        ],
        workExperience: [
          {
            title: "UI/UX設計師",
            company: "軟體開發公司",
            period: "2020-09 - 至今",
            description: "負責設計網站和應用程式的使用者界面，進行使用者研究和需求分析，創建線框圖、用戶流程和高保真原型。透過A/B測試優化設計，提升用戶轉換率25%。與開發團隊密切合作，確保設計的可行性和一致性。"
          },
          {
            title: "網頁設計實習生",
            company: "數位行銷公司",
            period: "2019-07 - 2020-02",
            description: "協助設計公司網站和客戶的行銷素材，學習使用者體驗設計流程和工具，參與用戶測試和回饋收集。"
          }
        ],
        skills: [
          "UI/UX設計", 
          "使用者研究", 
          "原型設計", 
          "Figma/Sketch", 
          "Adobe Creative Suite", 
          "響應式設計",
          "設計系統建立",
          "視覺識別設計"
        ],
        interests: ["設計思考", "使用者心理學", "互動設計", "數位藝術"]
      },
      industrySettings: {
        jobCategory: "design",
        jobSubcategory: "ui_ux_design",
        specificPosition: "資深UI/UX設計師",
        keywords: ["使用者體驗", "視覺設計", "設計思考", "使用者研究", "創意表達", "團隊合作", "溝通能力"],
        focusAreas: ["skills", "experience", "achievements"]
      },
      generationSettings: {
        tone: "Creative",
        outputLength: "Medium",
        language: "Chinese",
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      }
    }
  },
  
  // 醫護人員範例
  {
    id: "sample-healthcare-professional",
    title: "護理師自我介紹範例",
    status: "completed",
    lastEdited: new Date().toISOString().slice(0, 7),
    description: "醫療照護專業人員的自我介紹專案",
    formData: {
      personalInfo: {
        name: "吳雅婷",
        email: "example@mail.com",
        phone: "0967-890-123",
        location: "台中市",
        education: [
          "國立陽明交通大學 護理學系 學士 (2014-2018)",
          "台大醫院護理師執照 (2018)"
        ],
        workExperience: [
          {
            title: "專科護理師",
            company: "大型教學醫院",
            period: "2020-03 - 至今",
            description: "負責加護病房患者的全面照護，監測生命徵象並進行醫療處置。與醫師團隊密切配合，參與醫療決策討論。指導新進護理人員並提供家屬衛教，提高病患照護滿意度。"
          },
          {
            title: "護理師",
            company: "區域醫院",
            period: "2018-08 - 2020-02",
            description: "於內科病房提供患者照護，執行醫囑並記錄病患狀況。學習臨床護理技能與緊急狀況處理，建立與病患及家屬的良好溝通關係。"
          }
        ],
        skills: [
          "專科護理技能", 
          "重症照護", 
          "緊急救護", 
          "病患評估", 
          "醫護團隊合作", 
          "衛教指導",
          "醫療記錄管理",
          "醫病溝通"
        ],
        interests: ["醫療新知", "預防醫學", "長期照護", "身心健康照護"]
      },
      industrySettings: {
        jobCategory: "research",
        jobSubcategory: "nurse",
        specificPosition: "資深專科護理師",
        keywords: ["專業照護", "臨床技能", "團隊合作", "同理心", "細心負責", "溝通技巧", "壓力管理"],
        focusAreas: ["experience", "skills", "personality"]
      },
      generationSettings: {
        tone: "Confident",
        outputLength: "Medium",
        language: "Chinese",
        highlightStrengths: true,
        includeCallToAction: true,
        focusOnRecentExperience: true
      }
    }
  }
];

export default sampleProjects; 