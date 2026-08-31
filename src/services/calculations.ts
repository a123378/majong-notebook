import { GameStats, RoundActionType, RoundRecord, TsumoDetails } from '../types/mahjong';

/**
 * 計算單局計費與生成完整算式
 */
export function calculateRound(params: {
  actionType: RoundActionType;
  base: number;
  taiPrice: number;
  taiCount: number;
  isDealer?: boolean;
  streakCount?: number;
  tags?: string[];
  note?: string;
  roundNumber: number;
}): RoundRecord {
  const { actionType, base, taiPrice, taiCount, isDealer, streakCount = 0, tags, note, roundNumber } = params;

  let amount = 0;
  let formattedFormula = '';
  let tsumoDetails: TsumoDetails | undefined = undefined;

  const singleHandPrice = base + taiCount * taiPrice;

  switch (actionType) {
    case 'win': {
      // 胡牌: + (底價 + 台數 × 台價)
      amount = singleHandPrice;
      formattedFormula = `胡牌 (${taiCount}台): 底 $${base} + ${taiCount}台 × $${taiPrice} = +$${amount}`;
      break;
    }

    case 'dealIn': {
      // 放槍: - (底價 + 台數 × 台價)
      amount = -singleHandPrice;
      formattedFormula = `放槍 (${taiCount}台): -(底 $${base} + ${taiCount}台 × $${taiPrice}) = -$${Math.abs(amount)}`;
      break;
    }

    case 'tsumoLoss': {
      // 被自摸: - (底價 + 台數 × 台價)
      amount = -singleHandPrice;
      formattedFormula = `被自摸 (${taiCount}台): -(底 $${base} + ${taiCount}台 × $${taiPrice}) = -$${Math.abs(amount)}`;
      break;
    }

    case 'draw': {
      // 流局沒事: 0 元
      amount = 0;
      formattedFormula = '流局沒事: 總局數 +1，金額不變 ($0)';
      break;
    }

    case 'tsumo': {
      // 自摸特殊演算法
      if (isDealer) {
        // 自己是莊家: (底價 + 台數 × 台價) × 3
        const total = singleHandPrice * 3;
        amount = total;
        tsumoDetails = {
          isDealer: true,
          streakCount: 0,
          dealerExtraTai: 0,
          nonDealerEach: singleHandPrice,
          nonDealerTotal: singleHandPrice * 2,
          dealerAmount: singleHandPrice,
          totalAmount: total,
        };
        formattedFormula = `莊家自摸 (${taiCount}台): (底 $${base} + ${taiCount}台 × $${taiPrice}) × 3家 = +$${amount}`;
      } else {
        // 自己非莊家: 別人連 N 莊，莊家額外台數 = 2N + 1
        const N = Math.max(0, Math.floor(streakCount));
        const dealerExtraTai = 2 * N + 1;
        const nonDealerEach = singleHandPrice;
        const nonDealerTotal = nonDealerEach * 2;
        const dealerAmount = base + (taiCount + dealerExtraTai) * taiPrice;
        const total = nonDealerTotal + dealerAmount;

        amount = total;
        tsumoDetails = {
          isDealer: false,
          streakCount: N,
          dealerExtraTai,
          nonDealerEach,
          nonDealerTotal,
          dealerAmount,
          totalAmount: total,
        };

        const streakDesc = N === 0 ? '莊家沒連莊 (莊家+1台)' : `莊家連${N} (莊家+${dealerExtraTai}台)`;
        formattedFormula = `自摸 (${taiCount}台，${streakDesc}): 兩家閒家各 $${nonDealerEach} ($${nonDealerTotal}) + 莊家 $${dealerAmount} = +$${amount}`;
      }
      break;
    }
  }

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `round_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    roundNumber,
    actionType,
    base,
    taiPrice,
    taiCount: actionType === 'draw' ? 0 : taiCount,
    amount,
    tsumoDetails,
    tags: tags && tags.length > 0 ? tags : undefined,
    note: note || undefined,
    timestamp: Date.now(),
    formattedFormula,
  };
}

/**
 * 依據局數清單重新統計各項指標與比率
 */
export function calculateStats(rounds: RoundRecord[]): GameStats {
  const totalRounds = rounds.length;
  let netAmount = 0;
  let tsumoCount = 0;
  let winCount = 0;
  let dealInCount = 0;
  let tsumoLossCount = 0;
  let drawCount = 0;

  for (const r of rounds) {
    netAmount += r.amount;
    switch (r.actionType) {
      case 'tsumo':
        tsumoCount++;
        break;
      case 'win':
        winCount++;
        break;
      case 'dealIn':
        dealInCount++;
        break;
      case 'tsumoLoss':
        tsumoLossCount++;
        break;
      case 'draw':
        drawCount++;
        break;
    }
  }

  const roundDenominator = totalRounds > 0 ? totalRounds : 1;

  const tsumoRate = totalRounds > 0 ? Number(((tsumoCount / roundDenominator) * 100).toFixed(1)) : 0;
  const winRate = totalRounds > 0 ? Number(((winCount / roundDenominator) * 100).toFixed(1)) : 0;
  const dealInRate = totalRounds > 0 ? Number(((dealInCount / roundDenominator) * 100).toFixed(1)) : 0;
  const tsumoLossRate = totalRounds > 0 ? Number(((tsumoLossCount / roundDenominator) * 100).toFixed(1)) : 0;
  const drawRate = totalRounds > 0 ? Number(((drawCount / roundDenominator) * 100).toFixed(1)) : 0;
  const overallWinRate = totalRounds > 0 ? Number((((tsumoCount + winCount) / roundDenominator) * 100).toFixed(1)) : 0;

  return {
    totalRounds,
    netAmount,
    tsumoCount,
    winCount,
    dealInCount,
    tsumoLossCount,
    drawCount,
    tsumoRate,
    winRate,
    dealInRate,
    tsumoLossRate,
    drawRate,
    overallWinRate,
  };
}

/**
 * 臺灣麻將常見牌型與台數速查表
 */
export interface TaiItem {
  id: string;
  name: string;
  tai: number;
  category: 'basic' | 'medium' | 'advanced' | 'rare';
  description: string;
}

export const TAI_CHEAT_SHEET: TaiItem[] = [
  { id: 'men-qing', name: '門清', tai: 1, category: 'basic', description: '沒有吃、碰、槓任何牌（可自摸或胡牌）' },
  { id: 'zi-mo', name: '自摸', tai: 1, category: 'basic', description: '胡自己摸進來的牌' },
  { id: 'ping-hu', name: '平胡', tai: 2, category: 'basic', description: '全順子、無字牌、雙頭聽、非自摸' },
  { id: 'feng-pai', name: '圈風 / 門風 / 三元牌', tai: 1, category: 'basic', description: '符合東南西北或中發白的刻子' },
  { id: 'hua-pai', name: '花牌 (正花/台)', tai: 1, category: 'basic', description: '摸到與自己門風對應之花牌' },
  { id: 'du-ting', name: '獨聽 (單騎/邊張/嵌張)', tai: 1, category: 'basic', description: '單聽一張牌胡牌' },
  { id: 'gang-shang', name: '槓上開花', tai: 1, category: 'basic', description: '摸槓牌後補牌自摸' },
  { id: 'hai-di', name: '海底撈月', tai: 1, category: 'basic', description: '摸最後一張底牌自摸' },
  { id: 'qiang-gang', name: '搶槓', tai: 1, category: 'basic', description: '他人加槓時胡該張牌' },
  { id: 'san-an-ke', name: '三暗刻', tai: 2, category: 'medium', description: '手中擁有 3 組自己摸進來的刻子' },
  { id: 'quan-qiu-ren', name: '全球人 (獨聽)', tai: 2, category: 'medium', description: '手中只剩一張單騎聽牌，其餘全吃碰槓' },
  { id: 'peng-peng-hu', name: '碰碰胡', tai: 4, category: 'medium', description: '全刻子或槓子組合，無任何順子' },
  { id: 'hun-yi-se', name: '混一色', tai: 4, category: 'medium', description: '由單一花色（萬/筒/條）搭配字牌組成' },
  { id: 'xiao-san-yuan', name: '小三元', tai: 4, category: 'medium', description: '中發白其中兩組刻子，一組為雀頭(將牌)' },
  { id: 'si-an-ke', name: '四暗刻', tai: 5, category: 'advanced', description: '手中擁有 4 組自己摸進來的刻子' },
  { id: 'qing-yi-se', name: '清一色', tai: 8, category: 'advanced', description: '整副牌全為同一花色（萬/筒/條），無字牌' },
  { id: 'da-san-yuan', name: '大三元', tai: 8, category: 'advanced', description: '中、發、白三組皆為刻子' },
  { id: 'wu-an-ke', name: '五暗刻', tai: 8, category: 'advanced', description: '手中擁有 5 組自己摸進來的刻子' },
  { id: 'xiao-si-xi', name: '小四喜', tai: 8, category: 'advanced', description: '東南西北三組刻子，一組為雀頭' },
  { id: 'da-si-xi', name: '大四喜', tai: 16, category: 'rare', description: '東、南、西、北四組皆為刻子' },
  { id: 'tian-hu', name: '天胡 (莊家)', tai: 16, category: 'rare', description: '莊家開局配完牌直接自摸' },
  { id: 'di-hu', name: '地胡 (閒家)', tai: 16, category: 'rare', description: '莊家打出第一張牌即被閒家胡牌' },
  { id: 'ba-xian-guo-hai', name: '八仙過海', tai: 8, category: 'rare', description: '一人集齊春夏秋冬梅蘭竹菊八張花牌' },
];
