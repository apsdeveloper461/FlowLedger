'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import OutflowForm from '../../app/(dashboard)/outflow/_components/OutflowForm';

interface OutflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OutflowDialog({ open, onOpenChange, onSuccess }: OutflowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Outflow</DialogTitle>
          <DialogDescription>Log money leaving a wallet</DialogDescription>
        </DialogHeader>
        <OutflowForm onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
