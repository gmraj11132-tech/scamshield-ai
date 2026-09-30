import { AnalysisResult, HistoryItem } from '../types';

const STORAGE_KEY = 'scamshield_analysis_history_v1';

export function saveToHistory(result: AnalysisResult): void {
  try {
    const existing = getHistory();
    // Generate preview
    const preview = result.rawInput.length > 90
      ? result.rawInput.substring(0, 90).replace(/\s+/g, ' ') + '...'
      : result.rawInput.replace(/\s+/g, ' ');

    const item: HistoryItem = {
      id: result.id,
      timestamp: result.timestamp,
      inputType: result.inputType,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      preview: preview || `Analysis scan ${result.id}`,
      result
    };

    // Filter duplicates and prepend newest
    const updated = [item, ...existing.filter(h => h.id !== result.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save analysis to localStorage:', err);
  }
}

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.warn('Failed to load history from localStorage:', err);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}

export function exportHistoryAsJson(): void {
  const history = getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scamshield-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
