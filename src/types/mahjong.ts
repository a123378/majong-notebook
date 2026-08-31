export type RoundActionType = 'win' | 'dealIn' | 'tsumo' | 'tsumoLoss' | 'draw';

export interface TsumoDetails {
  isDealer: boolean;              // 自己是否為莊家
  streakCount: number;            // 若非莊家：別人連莊數 N (N >= 0)
  dealerExtraTai: number;         // 莊家額外台數: 2N + 1 (若非莊家)
  nonDealerEach: number;          // 兩位非莊家各自金額: (底 + 台數 × 台價)
  nonDealerTotal: number;         // 兩位非莊家總金額: (底 + 台數 × 台價) × 2
  dealerAmount: number;           // 莊家支付金額: 底 + (台數 + 2N + 1) × 台價
  totalAmount: number;            // 總收取金額
}

export interface RoundRecord {
  id: string;
  roundNumber: number;
  actionType: RoundActionType;
  base: number;                   // 當前底價
  taiPrice: number;               // 當前台價
  taiCount: number;               // 牌型台數 (流局為 0)
  amount: number;                 // 本局淨盈虧 (正數、負數或 0)
  tsumoDetails?: TsumoDetails;    // 自摸專用計算數據
  tags?: string[];                // 牌型標籤 (例: 門清、自摸、碰碰胡)
  note?: string;                  // 自訂筆記
  timestamp: number;              // 記錄時間戳
  formattedFormula: string;       // 詳細計費算式文字 (供明細與戰報檢視)
}

export interface GameStats {
  totalRounds: number;
  netAmount: number;
  tsumoCount: number;             // 自摸數
  winCount: number;               // 胡牌數
  dealInCount: number;            // 放槍數
  tsumoLossCount: number;         // 被自摸數
  drawCount: number;              // 流局數
  tsumoRate: number;              // 本場自摸率 (%)
  winRate: number;                // 本場胡牌率 (%)
  dealInRate: number;             // 本場放槍率 (%)
  tsumoLossRate: number;          // 本場被自摸率 (%)
  drawRate: number;               // 本場流局率 (%)
  overallWinRate: number;         // 綜合勝率 (%) = (自摸 + 胡牌) / 總局數
}

export interface GameSession {
  id: string;
  roomCode?: string;
  title: string;
  base: number;
  taiPrice: number;
  startTime: number;
  endTime?: number;
  rounds: RoundRecord[];
  netAmount: number;
  stats: GameStats;
  isArchived: boolean;
  updatedAt: number;
}

export interface SyncQueueItem {
  id: string;
  sessionId: string;
  action: 'UPSERT_SESSION' | 'DELETE_SESSION';
  data: GameSession;
  timestamp: number;
}

export interface CloudConfig {
  roomCode: string;
  enabled: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  lastSyncedAt?: number;
}

export interface BaseTaiPreset {
  id: string;
  label: string;
  base: number;
  taiPrice: number;
}

export const DEFAULT_PRESETS: BaseTaiPreset[] = [
  { id: '30-10', label: '底 30 / 台 10', base: 30, taiPrice: 10 },
  { id: '50-20', label: '底 50 / 台 20', base: 50, taiPrice: 20 },
  { id: '100-20', label: '底 100 / 台 20', base: 100, taiPrice: 20 },
  { id: '100-50', label: '底 100 / 台 50', base: 100, taiPrice: 50 },
  { id: '200-50', label: '底 200 / 台 50', base: 200, taiPrice: 50 },
  { id: '300-100', label: '底 300 / 台 100', base: 300, taiPrice: 100 },
];
