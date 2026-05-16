export const TRANSACTION_TYPES = {
  inflow: { label: 'Inflow', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  outflow: { label: 'Outflow', color: 'text-rose-500', bgColor: 'bg-rose-500/10' },
  transfer_out: { label: 'Transfer Out', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  transfer_in: { label: 'Transfer In', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  transfer_fee: { label: 'Transfer Fee', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
} as const;

export type TransactionTypeKey = keyof typeof TRANSACTION_TYPES;
