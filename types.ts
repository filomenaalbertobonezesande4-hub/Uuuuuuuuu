
export interface Nutrient {
  label: string;
  value: number;
  unit: string;
}

export interface MacroData {
  name: string;
  value: number;
  color: string;
}

export interface FoodAnalysisResult {
  foodName: string;
  confidence: number;
  description: string;
  estimatedWeight: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micronutrients: Nutrient[];
  allergens: string[];
  healthScore: number; // 0-100
  pros: string[];
  cons: string[];
  tips: string[];
  processingLevel: 'Natural' | 'Minimamente Processado' | 'Processado' | 'Ultraprocessado';
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  image?: string;
  result: FoodAnalysisResult;
}
