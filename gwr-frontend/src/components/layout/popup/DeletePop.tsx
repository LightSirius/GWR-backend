import { Button, CloseButton, Dialog, Portal } from '@chakra-ui/react';
import React from 'react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeletePop = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'title',
  description = 'description',
}: DeleteDialogProps) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <p>{description}</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="subtle" onClick={onClose}>
                취소
              </Button>
              <Button
                variant="subtle"
                colorPalette={'gray'}
                onClick={onConfirm}
              >
                확인
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default DeletePop;
