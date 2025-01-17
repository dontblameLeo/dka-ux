import "./App.css";
import InputField from "./components/InputField/InputField";
import React, { useEffect, useReducer, useState } from "react";
import { Task } from "./models/models";
import TaskList from "./components/TaskList/TaskList";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { ErrorMsg } from "./utils/errors";

export enum TaskStatus {
  AllTasks = "ALL_TASKS",
  Todo = "TODO",
  Doing = "DOING",
  Done = "DONE",
}

export type Actions =
  | {
      type: "ADD";
      payload: { text: string; taskListId: number; status: TaskStatus };
    }
  | { type: "EDIT"; payload: { id: number; task: string; status?: TaskStatus } }
  | { type: "REMOVE"; payload: number }
  | {
      type: "DRAG";
      payload: { id: number; taskListId: number; destinationIndex: number };
    }
  | { type: "UPDATE_STATUS"; payload: { id: number; status: TaskStatus } };

function TaskReducer(state: Task[], action: Actions) {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: Date.now(),
          task: action.payload.text,
          isDone: false,
          taskListId: action.payload.taskListId,
          status: action.payload.status,
        },
      ];
    case "EDIT":
      return state.map((task) =>
        task.id === action.payload.id
          ? action.payload.status
            ? {
                ...task,
                task: action.payload.task,
                status: action.payload.status,
              }
            : { ...task, task: action.payload.task }
          : task,
      );
    case "REMOVE":
      return state.filter((task) => task.id !== action.payload);
    case "DRAG":
      let draggedItem;
      const allTasks = state.map((task) => {
        if (task.id === action.payload.id) {
          draggedItem = { ...task, taskListId: action.payload.taskListId };
          return draggedItem;
        }
        return task;
      });
      const destinationCategory = allTasks.filter(
        (task) => task.taskListId === action.payload.taskListId,
      );

      if (draggedItem) {
        const destinationWithoutDraggedItem = destinationCategory.filter(
          (task) => task.id !== action.payload.id,
        );

        destinationWithoutDraggedItem.splice(
          action.payload.destinationIndex,
          0,
          draggedItem,
        );

        return allTasks
          .filter((task) => task.taskListId !== action.payload.taskListId)
          .concat(destinationWithoutDraggedItem);
      }

      return allTasks;
    case "UPDATE_STATUS":
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, status: action.payload.status }
          : task,
      );
    default:
      return state;
  }
}

export interface TaskListItem {
  id: number;
  name: string;
}

function App() {
  const [state, dispatch] = useReducer(TaskReducer, [], () => {
    const storedValue = localStorage.getItem("TASKS");
    return storedValue ? JSON.parse(storedValue) : [];
  });
  const [taskList, setTaskList] = useState<string>("");
  const [allTaskLists, setAllTaskLists] = useState<TaskListItem[]>(() => {
    const storedValue = localStorage.getItem("ALL_TASKS_LISTS");
    return storedValue ? JSON.parse(storedValue) : [];
  });
  const [errorMessage, setErrorMessage] = useState<string>();
  const [invalidCharacter, setInvalidCharacter] = useState<string>();

  useEffect(() => {
    localStorage.setItem("TASKS", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem("ALL_TASKS_LISTS", JSON.stringify(allTaskLists));
  }, [allTaskLists]);

  useEffect(() => {
    if (errorMessage) {
      const inputBox = document.querySelector(
        ".input-box",
      ) as HTMLInputElement | null;
      if (inputBox) {
        inputBox.focus();
      }
    }
  }, [errorMessage]);

  function handleTaskListSubmit(
    e: React.FormEvent,
    taskListId?: number,
    editedTaskListName?: string,
  ) {
    e.preventDefault();

    if (taskListId && editedTaskListName) {
      setAllTaskLists((prev) =>
        prev.map((taskList) =>
          taskList.id === taskListId
            ? { ...taskList, name: editedTaskListName }
            : taskList,
        ),
      );
      setTaskList("");
      setErrorMessage("");
    } else {
      if (allTaskLists.some((task) => task.name.trim() === taskList.trim())) {
        setErrorMessage(ErrorMsg.TASK_LIST_EXISTS);
      } else {
        setAllTaskLists((prev) => [
          ...prev,
          { id: prev.length + 1, name: taskList },
        ]);
        setTaskList("");
      }
    }
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        source.index === destination.index)
    )
      return;

    dispatch({
      type: "DRAG",
      payload: {
        id: parseInt(result.draggableId),
        taskListId: parseInt(destination.droppableId),
        destinationIndex: destination.index,
      },
    });
  }

  function deleteTaskList(id: number) {
    state.forEach((task) => {
      if (task.taskListId === id) {
        dispatch({ type: "REMOVE", payload: task.id });
      }
    });
    setAllTaskLists((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={"app"}>
        <span className={"header"}> DK&A Tasks </span>
        <InputField
          taskList={taskList}
          setTaskList={setTaskList}
          handleTaskListSubmit={handleTaskListSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          setInvalidCharacter={setInvalidCharacter}
        />
        <div className={"error-container"}>
          <div className={`error-content ${errorMessage ? "expanded" : ""}`}>
            <div className={"error-msg"}>
              {errorMessage}
              <span className={"invalid-character"}>
                {invalidCharacter ? invalidCharacter : ""}
              </span>
            </div>
          </div>
        </div>
        <TaskList
          allTaskLists={allTaskLists}
          tasks={state}
          dispatch={dispatch}
          deleteTaskList={deleteTaskList}
          handleTaskListSubmit={handleTaskListSubmit}
        />
      </div>
    </DragDropContext>
  );
}

export default App;
