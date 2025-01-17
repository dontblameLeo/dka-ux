import React, { useRef } from "react";
import "./InputField.css";
import { ErrorMsg } from "../../utils/errors";

interface InputFieldProps {
  handleTaskListSubmit: (e: React.FormEvent) => void;
  taskList?: string;
  setTaskList: React.Dispatch<React.SetStateAction<string>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
  errorMessage?: string;
  setInvalidCharacter: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function InputField({
  handleTaskListSubmit,
  taskList,
  setTaskList,
  setErrorMessage,
  errorMessage,
  setInvalidCharacter,
}: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function checkUnicode(text: string) {
    const regex = /^\s*[\p{L}\p{N}\s]*$/u;

    if (!regex.test(text)) {
      setErrorMessage(ErrorMsg.INVALID_CHARACTER);
      if (!errorMessage) {
        const lastCharacter = text.slice(-1);
        setInvalidCharacter(lastCharacter);
        setTaskList(text);
      } else {
        if (text.length === 0) setTaskList(text);
      }
    } else if (text.length >= 60) {
      setErrorMessage(ErrorMsg.LONG_LIST);
    } else {
      setTaskList(text);
      setErrorMessage("");
      setInvalidCharacter("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!errorMessage) {
      handleTaskListSubmit(e);
      inputRef.current?.blur();
    }
  }

  return (
    <form
      className={"input"}
      onSubmit={(e) => {
        handleSubmit(e);
      }}
    >
      <input
        aria-label={"Enter a name for your new list"}
        ref={inputRef}
        type="input"
        placeholder="Add a task list"
        className={"input-box"}
        value={taskList}
        onChange={(e) => checkUnicode(e.target.value)}
      />
      <button
        aria-label={"Button for submitting task list name"}
        type="submit"
        className={"task-submit"}
      >
        Add
      </button>
    </form>
  );
}

export default InputField;
