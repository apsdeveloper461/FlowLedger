import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { TransactionType } from '../transactions/enums/transaction-type.enum';

@Injectable()
export class AnalyticsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // ─── Dashboard Stats (top cards) ─────────────────────────────────────────

  async getDashboardStats(userId: string, query: AnalyticsQueryDto) {
    const { dateFrom, dateTo, walletId } = query;

    const params: (string | undefined)[] = [userId, dateFrom, dateTo, walletId];

    const walletFilter = walletId
      ? `AND (t.wallet_id = $4 OR t.to_wallet_id = $4)`
      : '';

    const dateFilter = `
      ${dateFrom ? `AND t.date >= $2` : ''}
      ${dateTo ? `AND t.date <= $3` : ''}
    `;

    // Total wallet balance
    const balanceQuery = await this.dataSource.query(
      `SELECT COALESCE(SUM(w.balance), 0) AS "totalBalance"
       FROM wallets w
       WHERE w.user_id = $1 AND w.is_archived = false
       ${walletId ? 'AND w.id = $4' : ''}`,
      params.filter(Boolean),
    );

    // Period aggregates using QueryBuilder approach for clarity
    const aggregates = await this.dataSource.query(
      `SELECT
         COALESCE(SUM(CASE WHEN t.type = 'inflow' THEN t.amount ELSE 0 END), 0) AS "totalInflow",
         COALESCE(SUM(CASE WHEN t.type = 'outflow' THEN t.amount ELSE 0 END), 0) AS "totalOutflow",
         COALESCE(SUM(CASE WHEN t.type = 'transfer_fee' THEN t.amount ELSE 0 END), 0) AS "totalFees"
       FROM transactions t
       WHERE t.user_id = $1
         ${dateFrom ? `AND t.date >= '${dateFrom}'` : ''}
         ${dateTo ? `AND t.date <= '${dateTo}'` : ''}
         ${walletId ? `AND (t.wallet_id = '${walletId}' OR t.to_wallet_id = '${walletId}')` : ''}`,
      [userId],
    );

    return {
      totalBalance: parseFloat(balanceQuery[0]?.totalBalance ?? '0'),
      totalInflow: parseFloat(aggregates[0]?.totalInflow ?? '0'),
      totalOutflow: parseFloat(aggregates[0]?.totalOutflow ?? '0'),
      totalFees: parseFloat(aggregates[0]?.totalFees ?? '0'),
    };
  }

  // ─── 1. Daily Inflow vs Outflow (last 30 days) ───────────────────────────

  async getDailyFlow(userId: string, query: AnalyticsQueryDto) {
    const dateFrom = query.dateFrom ?? this.daysAgo(30);
    const dateTo = query.dateTo ?? this.today();

    const rows = await this.dataSource.query(
      `SELECT
         DATE(t.date) AS day,
         COALESCE(SUM(CASE WHEN t.type = 'inflow' THEN t.amount ELSE 0 END), 0) AS inflow,
         COALESCE(SUM(CASE WHEN t.type = 'outflow' THEN t.amount ELSE 0 END), 0) AS outflow
       FROM transactions t
       WHERE t.user_id = $1 AND t.date >= $2 AND t.date <= $3
         ${query.walletId ? `AND t.wallet_id = '${query.walletId}'` : ''}
       GROUP BY DATE(t.date)
       ORDER BY day ASC`,
      [userId, dateFrom, dateTo],
    );

    return rows.map((r: { day: string; inflow: string; outflow: string }) => ({
      day: r.day,
      inflow: parseFloat(r.inflow),
      outflow: parseFloat(r.outflow),
    }));
  }

  // ─── 2. Spend Tag Breakdown (donut) ──────────────────────────────────────

  async getSpendTagBreakdown(userId: string, query: AnalyticsQueryDto) {
    const dateFrom = query.dateFrom ?? this.daysAgo(30);
    const dateTo = query.dateTo ?? this.today();

    const rows = await this.dataSource.query(
      `SELECT
         st.id, st.name, st.color,
         COALESCE(SUM(t.amount), 0) AS total
       FROM transactions t
       JOIN spend_tags st ON st.id = t.spend_tag_id
       WHERE t.user_id = $1
         AND t.type = 'outflow'
         AND t.date >= $2 AND t.date <= $3
         ${query.walletId ? `AND t.wallet_id = '${query.walletId}'` : ''}
       GROUP BY st.id, st.name, st.color
       ORDER BY total DESC`,
      [userId, dateFrom, dateTo],
    );

    return rows.map((r: { id: string; name: string; color: string; total: string }) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      total: parseFloat(r.total),
    }));
  }

  // ─── 3. Wallet Balance Distribution ──────────────────────────────────────

  async getWalletBalances(userId: string) {
    const rows = await this.dataSource.query(
      `SELECT id, name, color, type, balance
       FROM wallets
       WHERE user_id = $1 AND is_archived = false
       ORDER BY balance DESC`,
      [userId],
    );

    return rows.map((r: { id: string; name: string; color: string; type: string; balance: string }) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      type: r.type,
      balance: parseFloat(r.balance),
    }));
  }

  // ─── 4. Monthly Net Flow Trend (last 6 months) ───────────────────────────

  async getMonthlyNetFlow(userId: string) {
    const rows = await this.dataSource.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', t.date), 'YYYY-MM') AS month,
         COALESCE(SUM(CASE WHEN t.type = 'inflow' THEN t.amount ELSE 0 END), 0) AS inflow,
         COALESCE(SUM(CASE WHEN t.type = 'outflow' THEN t.amount ELSE 0 END), 0) AS outflow
       FROM transactions t
       WHERE t.user_id = $1
         AND t.date >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', t.date)
       ORDER BY month ASC`,
      [userId],
    );

    return rows.map((r: { month: string; inflow: string; outflow: string }) => ({
      month: r.month,
      inflow: parseFloat(r.inflow),
      outflow: parseFloat(r.outflow),
      net: parseFloat(r.inflow) - parseFloat(r.outflow),
    }));
  }

  // ─── 5. Top 5 Spend Tags ─────────────────────────────────────────────────

  async getTopSpendTags(userId: string, query: AnalyticsQueryDto) {
    const dateFrom = query.dateFrom ?? this.daysAgo(30);
    const dateTo = query.dateTo ?? this.today();

    const rows = await this.dataSource.query(
      `SELECT
         st.id, st.name, st.color,
         COALESCE(SUM(t.amount), 0) AS total
       FROM transactions t
       JOIN spend_tags st ON st.id = t.spend_tag_id
       WHERE t.user_id = $1
         AND t.type = 'outflow'
         AND t.date >= $2 AND t.date <= $3
       GROUP BY st.id, st.name, st.color
       ORDER BY total DESC
       LIMIT 5`,
      [userId, dateFrom, dateTo],
    );

    const maxTotal: number = rows.length > 0 ? parseFloat(rows[0].total) : 1;

    return rows.map((r: { id: string; name: string; color: string; total: string }) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      total: parseFloat(r.total),
      percentage: Math.round((parseFloat(r.total) / maxTotal) * 100),
    }));
  }

  // ─── 6. Transfer Fee Overview (last 6 months) ────────────────────────────

  async getTransferFeeOverview(userId: string) {
    const rows = await this.dataSource.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', t.date), 'YYYY-MM') AS month,
         COALESCE(SUM(t.amount), 0) AS totalFees
       FROM transactions t
       WHERE t.user_id = $1
         AND t.type = 'transfer_fee'
         AND t.date >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', t.date)
       ORDER BY month ASC`,
      [userId],
    );

    return rows.map((r: { month: string; totalFees: string }) => ({
      month: r.month,
      totalFees: parseFloat(r.totalFees),
    }));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }
}
