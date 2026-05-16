'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import InflowForm from '../../app/(dashboard)/inflow/_components/InflowForm';

interface InflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InflowDialog({ open, onOpenChange, onSuccess }: InflowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Inflow</DialogTitle>
          <DialogDescription>Add money coming into a wallet</DialogDescription>
        </DialogHeader>
        <InflowForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
