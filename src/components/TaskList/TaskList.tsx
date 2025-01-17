import React, { useEffect, useState } from "react";
import "../../styles/globalstyles.css";
import "./TaskList.css";
import { Task } from "../../models/models";
import SingleTask from "../SingleTask/SingleTask";
import { Actions, TaskStatus } from "../../App";
import { Droppable } from "@hello-pangea/dnd";
import TaskModal from "../TaskModal/TaskModal";
import { Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { checkColor, formatTextWithCapitalization } from "../../utils/helpers";
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi";
import { RiEditLine } from "react-icons/ri";
import { LuFilePlus2, LuTrash2 } from "react-icons/lu";

interface TaskListProps {
  dispatch: React.ActionDispatch<[action: Actions]>;
  allTaskLists: { name: string; id: number }[];
  tasks: Task[];
  deleteTaskList: (id: number) => void;
  handleTaskListSubmit: (
    e: React.FormEvent,
    taskListId?: number,
    editedTask?: string,
  ) => void;
}

function TaskList({
  tasks,
  allTaskLists,
  dispatch,
  deleteTaskList,
  handleTaskListSubmit,
}: TaskListProps) {
  const [edit, setEdit] = useState<boolean>();
  const [open, setOpen] = useState<boolean>(false);
  const [currentTaskListId, setCurrentTaskListId] = useState<number>();
  const [taskStatuses, setTaskStatuses] = useState<Record<number, TaskStatus>>(
    {},
  );
  const [taskListNames, setTaskListNames] = useState<Record<number, string>>(
    () => {
      const storedValue = localStorage.getItem("TASK_LIST_NAMES");
      return storedValue ? JSON.parse(storedValue) : [];
    },
  );
  const [taskListsCollapsed, setTaskListsCollapsed] = useState<
    Record<number, boolean>
  >(() => {
    const storedValue = localStorage.getItem("COLLAPSED_TASK_LISTS");
    return storedValue ? JSON.parse(storedValue) : [];
  });
  const [dropdownExpanded, setDropdownExpanded] = useState<boolean>(false);
  const [taskListExpanded, setTaskListExpanded] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem(
      "COLLAPSED_TASK_LISTS",
      JSON.stringify(taskListsCollapsed),
    );
  }, [taskListsCollapsed]);

  useEffect(() => {
    localStorage.setItem("TASK_LIST_NAMES", JSON.stringify(taskListNames));
  }, [taskListNames]);

  function handleOpen(taskListId: number) {
    setOpen(true);
    setCurrentTaskListId(taskListId);
  }

  const handleClose = () => setOpen(false);

  function handleEdit(taskListId: number) {
    setEdit(!edit);
    setCurrentTaskListId(taskListId);
  }

  // function scrollCarousel(direction: "left" | "right") {
  //   const carousel = document.querySelector(".carousel");
  //   const scrollAmount = 300;
  //   if (direction === "left") {
  //     carousel?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  //   } else if (direction === "right") {
  //     carousel?.scrollBy({ left: scrollAmount, behavior: "smooth" });
  //   }
  // }

  function filterByStatus(
    e: React.MouseEvent<HTMLDivElement>,
    status: TaskStatus,
    taskListId: number,
  ) {
    e.stopPropagation();

    setTaskStatuses((prev) => ({
      ...prev,
      [taskListId]: status,
    }));
  }

  function calculateTaskStatuses(id: number) {
    const filteredTasks = tasks.filter((task) => task.taskListId === id);
    const statusTasks =
      taskStatuses[id] === TaskStatus.AllTasks || !taskStatuses[id]
        ? filteredTasks
        : filteredTasks.filter((task) => task.status === taskStatuses[id]);
    return `${statusTasks.length} 
    / ${filteredTasks.length}`;
  }

  function editListName(text: string, taskListId: number) {
    setTaskListNames((prev) => ({
      ...prev,
      [taskListId]: text,
    }));
  }

  function toggleDropdown(e?: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.stopPropagation();
    setDropdownExpanded(!dropdownExpanded);
  }

  function toggleTaskListExpanded(taskListId: number) {
    setTaskListsCollapsed((prev) => ({
      ...prev,
      [taskListId]: !taskListsCollapsed[taskListId],
    }));
    setTaskListExpanded(!taskListExpanded);
  }

  function onEditNameSubmit(
    e: React.FormEvent<HTMLFormElement> | React.FocusEvent<HTMLInputElement>,
    taskList: { name: string; id: number },
  ) {
    const updatedListName = taskListNames[taskList.id]
      ? taskListNames[taskList.id]
      : taskList.name;
    handleTaskListSubmit(e, taskList.id, updatedListName);
    setEdit(false);
  }

  function totalListTasks(id: number) {
    return tasks.filter((task) => task.taskListId === id).length;
  }

  function handleTaskListDelete(taskListId: number) {
    deleteTaskList(taskListId);
    setTaskListNames((prev) => {
      const updatedNames = { ...prev };
      delete updatedNames[taskListId];

      return updatedNames;
    });
  }

  return (
    <div className={"droppable-container"}>
      <div className={"task-container droppable-content"}>
        {allTaskLists?.map((taskList) => (
          <Droppable
            key={`${taskList.id}-${allTaskLists.length}-${taskList.name}`}
            droppableId={`${taskList.id.toString()}-${taskList.name}`}
          >
            {(provided, snapshot) => (
              <div
                tabIndex={0}
                aria-label={`Task list: ${taskList.name}`}
                className={`task-list ${taskList.name} ${snapshot.isDraggingOver ? `drag` : ""}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <form
                  className={"task-list-header"}
                  onSubmit={(e) => {
                    onEditNameSubmit(e, taskList);
                  }}
                >
                  <div className={"task-list-top-slot"}>
                    <div style={{ display: "flex" }}>
                      {edit && taskList.id === currentTaskListId ? (
                        <div className={"task-list-title"}>
                          <RiEditLine />
                          <input
                            aria-label={`Edit task list name: ${taskList.name}`}
                            type="input"
                            autoFocus
                            className={"task-list-input"}
                            onBlur={(e) => onEditNameSubmit(e, taskList)}
                            value={
                              taskListNames[taskList.id]
                                ? taskListNames[taskList.id]
                                : taskList.name
                            }
                            onChange={(e) =>
                              editListName(e.target.value, taskList.id)
                            }
                          />
                        </div>
                      ) : (
                        <div className={"task-list-title"}>
                          <button
                            aria-label={"Edit list name"}
                            className="icon"
                            onClick={() => handleEdit(taskList.id)}
                          >
                            <RiEditLine />
                          </button>
                          <span onClick={() => handleEdit(taskList.id)}>
                            {taskList.name}
                          </span>
                        </div>
                      )}
                      {totalListTasks(taskList.id) !== 0 && (
                        <div className={"task-list-actions"}>
                          <div className={"task-amount"}>
                            {totalListTasks(taskList.id)}
                            {totalListTasks(taskList.id) <= 1
                              ? "Task"
                              : "Tasks"}
                          </div>

                          {taskListsCollapsed[taskList.id] ? (
                            <PiCaretDownBold
                              className={"caret-icon"}
                              onClick={() =>
                                toggleTaskListExpanded(taskList.id)
                              }
                            />
                          ) : (
                            <PiCaretUpBold
                              className={"caret-icon"}
                              onClick={() =>
                                toggleTaskListExpanded(taskList.id)
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </form>
                {totalListTasks(taskList.id) === 0 && (
                  <div className={"initial-task"}>
                    <button
                      className={`create-task-button`}
                      onClick={() => handleOpen(taskList.id)}
                    >
                      Create your first task here
                    </button>
                    <button
                      aria-label={"Remove list"}
                      className="icon"
                      onClick={() => handleTaskListDelete(taskList.id)}
                    >
                      <LuTrash2 />
                    </button>
                  </div>
                )}

                <div className={"expand-container"}>
                  <div
                    className={`expand-items ${taskListsCollapsed[taskList.id] || totalListTasks(taskList.id) === 0 ? "" : "expanded"}`}
                  >
                    <div className={`task-list-buttons`}>
                      <div className={"task-info"}>
                        <Dropdown>
                          <MenuButton
                            color={
                              taskStatuses[taskList.id]
                                ? checkColor(taskStatuses[taskList.id])
                                : undefined
                            }
                            variant={"solid"}
                            size={"sm"}
                            onClick={(e) => toggleDropdown(e)}
                          >
                            <div className={"dropdown-menu"}>
                              {taskStatuses[taskList.id]
                                ? formatTextWithCapitalization(
                                    taskStatuses[taskList.id],
                                  )
                                : formatTextWithCapitalization(
                                    TaskStatus.AllTasks,
                                  )}
                              {dropdownExpanded ? (
                                <PiCaretUpBold className={"caret-icon"} />
                              ) : (
                                <PiCaretDownBold className={"caret-icon"} />
                              )}
                            </div>
                          </MenuButton>
                          <Menu>
                            {Object.values(TaskStatus).map((status) => (
                              <MenuItem
                                aria-label={`Dropdown option ${status}`}
                                key={status}
                                onClick={(e) => {
                                  toggleDropdown();
                                  if (filterByStatus) {
                                    filterByStatus(e, status, taskList.id);
                                  }
                                }}
                              >
                                {formatTextWithCapitalization(status)}
                              </MenuItem>
                            ))}
                          </Menu>
                        </Dropdown>
                        <div className={"task-amounts"}>
                          Showing: {calculateTaskStatuses(taskList.id)}
                        </div>
                      </div>

                      <div className={"task-list-icons"}>
                        <button
                          aria-label={"Remove list"}
                          className="icon"
                          onClick={() => deleteTaskList(taskList.id)}
                        >
                          <LuTrash2 />
                        </button>
                        <button
                          aria-label={"Add new task"}
                          className="icon add-task"
                          onClick={() => handleOpen(taskList.id)}
                        >
                          <LuFilePlus2 />
                        </button>
                      </div>
                    </div>

                    <div className={`task-list-tasks`}>
                      <div className={"task-list-bottom-slot"}>
                        {tasks
                          .filter(
                            (item: Task) => item.taskListId === taskList.id,
                          )
                          .map((item: Task, index: number) => (
                            <div key={item.id}>
                              {taskStatuses[taskList.id] ===
                                TaskStatus.AllTasks ||
                              !taskStatuses[taskList.id] ? (
                                <SingleTask
                                  listName={taskList.name}
                                  key={item.id}
                                  index={index}
                                  task={item}
                                  dispatch={dispatch}
                                />
                              ) : item.status === taskStatuses[taskList.id] ? (
                                <SingleTask
                                  listName={taskList.name}
                                  key={item.id}
                                  index={index}
                                  task={item}
                                  dispatch={dispatch}
                                />
                              ) : (
                                ""
                              )}
                            </div>
                          ))}
                      </div>

                      {provided.placeholder}
                    </div>
                  </div>
                </div>
                {taskList.id === currentTaskListId && (
                  <TaskModal
                    taskListId={currentTaskListId}
                    listName={"New Task"}
                    open={open}
                    handleClose={handleClose}
                    dispatch={dispatch}
                  />
                )}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </div>
  );
}

export default TaskList;
