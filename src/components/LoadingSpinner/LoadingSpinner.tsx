import { Spinner } from '@chakra-ui/react';

export default function LoadingSpinner() {
  return (
    <div className="p-10 text-center">
      <Spinner w={24} h={24} thickness="8px" speed="0.9s" color="blue.500" />
    </div>
  );
}
