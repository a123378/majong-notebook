import { describe, it, expect } from 'vitest';
import { calculateRound, calculateStats } from './calculations';

describe('麻將記帳算式核心測試 (calculations)', () => {
  describe('基本動作計算', () => {
    it('胡牌 (底50/台20, 3台) = +110', () => {
      const round = calculateRound({
        actionType: 'win',
        base: 50,
        taiPrice: 20,
        taiCount: 3,
        roundNumber: 1
      });
      expect(round.amount).toBe(50 + 3 * 20); // 110
      expect(round.actionType).toBe('win');
      expect(round.formattedFormula).toContain('+$110');
    });

    it('放槍 (底50/台20, 2台) = -90', () => {
      const round = calculateRound({
        actionType: 'dealIn',
        base: 50,
        taiPrice: 20,
        taiCount: 2,
        roundNumber: 2
      });
      expect(round.amount).toBe(-(50 + 2 * 20)); // -90
      expect(round.formattedFormula).toContain('-$90');
    });

    it('被自摸 (底30/台10, 1台) = -40', () => {
      const round = calculateRound({
        actionType: 'tsumoLoss',
        base: 30,
        taiPrice: 10,
        taiCount: 1,
        roundNumber: 3
      });
      expect(round.amount).toBe(-(30 + 1 * 10)); // -40
      expect(round.formattedFormula).toContain('-$40');
    });

    it('流局沒事 = $0', () => {
      const round = calculateRound({
        actionType: 'draw',
        base: 100,
        taiPrice: 20,
        taiCount: 0,
        roundNumber: 4
      });
      expect(round.amount).toBe(0);
      expect(round.taiCount).toBe(0);
    });
  });

  describe('自摸特殊演算法與莊家連莊計算 (嚴格遵循需求)', () => {
    it('莊家自摸 (底50/台20, 3台) = (50 + 3*20) * 3 = +330', () => {
      const round = calculateRound({
        actionType: 'tsumo',
        base: 50,
        taiPrice: 20,
        taiCount: 3,
        isDealer: true,
        roundNumber: 1
      });
      expect(round.amount).toBe(330);
      expect(round.tsumoDetails?.isDealer).toBe(true);
      expect(round.tsumoDetails?.totalAmount).toBe(330);
      expect(round.formattedFormula).toContain('+$330');
    });

    it('非莊家自摸 (底50/台20, 3台, 別人連0莊 -> 莊家額外2*0+1=1台)', () => {
      // 2位非莊家 = (50 + 3*20) * 2 = 110 * 2 = 220
      // 莊家 = 50 + (3 + 1)*20 = 50 + 80 = 130
      // 總收入 = 220 + 130 = 350
      const round = calculateRound({
        actionType: 'tsumo',
        base: 50,
        taiPrice: 20,
        taiCount: 3,
        isDealer: false,
        streakCount: 0,
        roundNumber: 2
      });
      expect(round.tsumoDetails?.dealerExtraTai).toBe(1);
      expect(round.tsumoDetails?.nonDealerEach).toBe(110);
      expect(round.tsumoDetails?.nonDealerTotal).toBe(220);
      expect(round.tsumoDetails?.dealerAmount).toBe(130);
      expect(round.amount).toBe(350);
    });

    it('非莊家自摸 (底50/台20, 4台, 別人連2莊 -> 莊家額外2*2+1=5台)', () => {
      // 2位非莊家 = (50 + 4*20) * 2 = 130 * 2 = 260
      // 莊家 = 50 + (4 + 5)*20 = 50 + 180 = 230
      // 總收入 = 260 + 230 = 490
      const round = calculateRound({
        actionType: 'tsumo',
        base: 50,
        taiPrice: 20,
        taiCount: 4,
        isDealer: false,
        streakCount: 2,
        roundNumber: 3
      });
      expect(round.tsumoDetails?.dealerExtraTai).toBe(5);
      expect(round.tsumoDetails?.nonDealerTotal).toBe(260);
      expect(round.tsumoDetails?.dealerAmount).toBe(230);
      expect(round.amount).toBe(490);
    });

    it('非莊家自摸 (底100/台20, 2台, 別人連3莊 -> 莊家額外2*3+1=7台)', () => {
      // 2位非莊家 = (100 + 2*20) * 2 = 140 * 2 = 280
      // 莊家 = 100 + (2 + 7)*20 = 100 + 180 = 280
      // 總收入 = 280 + 280 = 560
      const round = calculateRound({
        actionType: 'tsumo',
        base: 100,
        taiPrice: 20,
        taiCount: 2,
        isDealer: false,
        streakCount: 3,
        roundNumber: 4
      });
      expect(round.tsumoDetails?.dealerExtraTai).toBe(7);
      expect(round.amount).toBe(560);
    });
  });

  describe('戰局統計與比率計算', () => {
    it('準確計算各項局數、盈虧與百分比', () => {
      const rounds = [
        calculateRound({ actionType: 'tsumo', base: 50, taiPrice: 20, taiCount: 2, isDealer: true, roundNumber: 1 }), // +270
        calculateRound({ actionType: 'win', base: 50, taiPrice: 20, taiCount: 1, roundNumber: 2 }), // +70
        calculateRound({ actionType: 'dealIn', base: 50, taiPrice: 20, taiCount: 2, roundNumber: 3 }), // -90
        calculateRound({ actionType: 'tsumoLoss', base: 50, taiPrice: 20, taiCount: 1, roundNumber: 4 }), // -70
        calculateRound({ actionType: 'draw', base: 50, taiPrice: 20, taiCount: 0, roundNumber: 5 }), // 0
      ];

      const stats = calculateStats(rounds);
      expect(stats.totalRounds).toBe(5);
      expect(stats.netAmount).toBe(270 + 70 - 90 - 70 + 0); // 180
      expect(stats.tsumoCount).toBe(1);
      expect(stats.winCount).toBe(1);
      expect(stats.dealInCount).toBe(1);
      expect(stats.tsumoLossCount).toBe(1);
      expect(stats.drawCount).toBe(1);

      // 各比率 (1 / 5 = 20.0%)
      expect(stats.tsumoRate).toBe(20.0);
      expect(stats.winRate).toBe(20.0);
      expect(stats.dealInRate).toBe(20.0);
      expect(stats.tsumoLossRate).toBe(20.0);
      expect(stats.drawRate).toBe(20.0);
      expect(stats.overallWinRate).toBe(40.0); // (1 + 1) / 5 = 40%
    });
  });
});
