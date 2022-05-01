import { UseToastOptions } from '@chakra-ui/react';

export default function toast(
  toast,
  toastStatus: string,
  toastTitle: string,
  toastDescription?: string
) {
  const toastId = 'toast';

  // don't allow duplicate toasts
  if (!toast.isActive(toastId)) {
    toast({
      id: toastId,
      status: toastStatus,
      title: toastTitle,
      description: toastDescription,
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  }
}
