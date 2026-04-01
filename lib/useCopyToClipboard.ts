import { useCallback,useState } from 'react';

type CopyToClipboard = (text: string) => Promise<boolean>;

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy: CopyToClipboard = useCallback(async (value: string) => {
    if (!navigator.clipboard) {
      setError(new Error('Clipboard API is not supported'))
      return false
    }

    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      setError(null)

      // reset after delay
      setTimeout(() => {
      	setIsCopied(false)
      }, 2000)

      return true
    } catch (error) {
      setError(error as Error)
      setIsCopied(false)
      return false
    }
  }, [])

  return { copy, isCopied, error };
}