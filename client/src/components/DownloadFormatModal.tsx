import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { DownloadFormat } from '@/types';

interface DownloadFormatModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (format: DownloadFormat) => void;
  title?: string;
  description?: string;
}

const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({
  open,
  onClose,
  onSelect,
  title = 'Select Download Format',
  description = 'Choose the format for your report download',
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 hover:border-destructive hover:bg-destructive/5 transition-all group"
            onClick={() => {
              onSelect('pdf');
              onClose();
            }}
          >
            <FileText className="h-12 w-12 text-destructive group-hover:scale-110 transition-transform" />
            <span className="font-medium">PDF Format</span>
            <span className="text-xs text-muted-foreground">Best for printing</span>
          </Button>
          <Button
            variant="outline"
            className="h-32 flex flex-col items-center justify-center gap-3 hover:border-success hover:bg-success/5 transition-all group"
            onClick={() => {
              onSelect('excel');
              onClose();
            }}
          >
            <FileSpreadsheet className="h-12 w-12 text-success group-hover:scale-110 transition-transform" />
            <span className="font-medium">Excel Format</span>
            <span className="text-xs text-muted-foreground">Best for analysis</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadFormatModal;
