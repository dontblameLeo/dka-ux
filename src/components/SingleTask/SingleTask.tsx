import React, { useState } from "react";
import { Task } from "../../models/models";
import "../../styles/globalstyles.css";
import "./SingleTask.css";
import { Actions, TaskStatus } from "../../App";
import { Draggable } from "@hello-pangea/dnd";
import TaskModal from "../TaskModal/TaskModal";
import { Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import { checkColor, formatTextWithCapitalization } from "../../utils/helpers";
import { LuTrash2 } from "react-icons/lu";
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi";
import { ClickAwayListener } from "@mui/material";

interface SingleTaskProps {
  task: Task;
  dispatch: React.ActionDispatch<[action: Actions]>;
  index: number;
  listName: string;
}

function SingleTask({ task, dispatch, index, listName }: SingleTaskProps) {
  const [dropdownExpanded, setDropdownExpanded] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function deleteTask(id: number) {
    dispatch({ type: "REMOVE", payload: id });
  }

  function updateStatus(
    e: React.MouseEvent<HTMLDivElement>,
    status: TaskStatus,
  ) {
    e.stopPropagation();
    dispatch({ type: "UPDATE_STATUS", payload: { id: task.id, status } });
  }

  function toggleDropdown(
    e?: React.MouseEvent<HTMLButtonElement> | MouseEvent | TouchEvent,
  ) {
    if (e) e.stopPropagation();
    setDropdownExpanded(!dropdownExpanded);
  }

  console.log("dropdownExpanded", dropdownExpanded);
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div>
          <div
            aria-label={"Press Enter to select and edit"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleOpen();
              }
            }}
            tabIndex={0}
            role={"button"}
            className={`task ${snapshot.isDragging ? "isDragging" : ""}`}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            onClick={handleOpen}
          >
            <div className={"single-task-top"}>
              <div className={"task-status-container"}>
                <Dropdown>
                  <MenuButton
                    variant={"solid"}
                    color={checkColor(task.status)}
                    size={"sm"}
                    onClick={(e) => toggleDropdown(e)}
                  >
                    {formatTextWithCapitalization(task.status)}
                    {dropdownExpanded ? (
                      <PiCaretUpBold className={"caret-icon"} />
                    ) : (
                      <PiCaretDownBold className={"caret-icon"} />
                    )}
                  </MenuButton>
                  <ClickAwayListener onClickAway={(e) => toggleDropdown(e)}>
                    <Menu>
                      {Object.values(TaskStatus).map(
                        (status) =>
                          status !== TaskStatus.AllTasks && (
                            <MenuItem
                              aria-label={`Dropdown option ${status}`}
                              key={status}
                              onClick={(e) => {
                                updateStatus(e, status);
                                toggleDropdown();
                              }}
                            >
                              {formatTextWithCapitalization(status)}
                            </MenuItem>
                          ),
                      )}
                    </Menu>
                  </ClickAwayListener>
                </Dropdown>
              </div>
              <button
                aria-label={"Remove task"}
                className="icon no-padding"
                onClick={() => deleteTask(task.id)}
              >
                <LuTrash2 />
              </button>
            </div>
            <div className={"single-task-bottom"}>
              <span className={"task-text"}>{task.task}</span>
            </div>
          </div>
          <TaskModal
            listName={listName}
            open={open}
            handleClose={handleClose}
            dispatch={dispatch}
            task={task}
          />
        </div>
      )}
    </Draggable>
  );
}

export default SingleTask;
