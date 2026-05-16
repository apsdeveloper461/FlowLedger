'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import TransferForm from '../../app/(dashboard)/transfer/_components/TransferForm';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TransferDialog({ open, onOpenChange, onSuccess }: TransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Execute Transfer</DialogTitle>
          <DialogDescription>Move funds between your wallets</DialogDescription>
        </DialogHeader>
        <TransferForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
