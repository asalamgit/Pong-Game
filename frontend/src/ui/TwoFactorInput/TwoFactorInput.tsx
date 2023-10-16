import { TWO_FA_CODE_REGEX } from '@/core/constants';
import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './TwoFactorInput.module.scss';

type Props = {
  onSubmit?(code: string): void;
  onChange?(code: string): void;
};

export function TwoFactorInput({ onChange, onSubmit }: Props) {
  const [code, setCode] = useState('');
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (inputsRef.current.length > 0) {
      inputsRef.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (code.length === 6) onChange?.(code);
  }, [onChange, code]);

  function refreshCode() {
    const newCode = inputsRef.current.map(({ value }) => value).join('');
    setCode(newCode);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (
      event.target.value.length !== 0 &&
      event.target.value.match(TWO_FA_CODE_REGEX)
    ) {
      refreshCode();
      if (event.target.nextElementSibling !== null)
        (event.target.nextElementSibling as HTMLInputElement).focus();
    } else {
      event.target.value = '';
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace') {
      const target = event.target as HTMLInputElement;
      if (target.value.length === 0) {
        if (target.previousElementSibling !== null) {
          (target.previousElementSibling as HTMLInputElement).focus();
          event.preventDefault();
        }
      } else {
        refreshCode();
      }
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData('Text');

    if (pastedValue.length > 6) return;

    for (let i = 0; i < pastedValue.length; i++) {
      const pastedCharacter = pastedValue.charAt(i);
      const currentValue = inputsRef.current[i].value;

      if (pastedCharacter.match(TWO_FA_CODE_REGEX)) {
        if (currentValue.length === 0) {
          inputsRef.current[i].value = pastedCharacter;
          refreshCode();
          if (inputsRef.current[i].nextElementSibling !== null) {
            (
              inputsRef.current[i].nextElementSibling as HTMLInputElement
            ).focus();
          }
        }
      }
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(code);
  };

  return (
    <form className={styles.inputWrapper} onSubmit={handleSubmit}>
      {Array.from({ length: 6 }, (_, index: number) => (
        <input
          key={index}
          type="tel"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          ref={(el: HTMLInputElement) => {
            inputsRef.current[index] = el;
          }}
          className={styles.input}
          maxLength={1}
        />
      ))}
      <button hidden type="submit" />
    </form>
  );
}
