export default function toast(
  toast,
  toastStatus,
  toastTitle,
  toastDescription
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
