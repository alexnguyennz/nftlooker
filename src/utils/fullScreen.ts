import { useToast } from '@chakra-ui/react';

import toast from '../components/Toast/Toast';

export default function fullScreen() {
  const elem = document.querySelector('model-viewer');

  const toastInstance = useToast();

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch((err) => {
      toast(
        toastInstance,
        'error',
        'Error attempting to enter fullscreen mode.',
        `${err}`
      );
    });
  } else {
    document.exitFullscreen();
  }
}
