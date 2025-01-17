import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
} from "@mui/material";
import { Task } from "../../models/models";
import { Dropdown, Menu, MenuButton, MenuItem, Textarea } from "@mui/joy";
import "./TaskModal.css";
import { Actions, TaskStatus } from "../../App";
import { checkColor, formatTextWithCapitalization } from "../../utils/helpers";
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi";

interface TaskModalProps {
  handleClose: () => void;
  open: boolean;
  task?: Task;
  dispatch: React.ActionDispatch<[action: Actions]>;
  listName: string;
  taskListId?: number;
}

function TaskModal({
  handleClose,
  open,
  task,
  dispatch,
  listName,
  taskListId,
}: TaskModalProps) {
  const [text, setText] = useState<string>(task ? task.task : "");
  const [dropdownExpanded, setDropdownExpanded] = useState<boolean>(false);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (task) {
      if (taskStatus) {
        dispatch({
          type: "EDIT",
          payload: { id: task.id, task: text, status: taskStatus },
        });
      } else {
        dispatch({
          type: "EDIT",
          payload: {
            id: task.id,
            task: text,
          },
        });
      }
    } else {
      if (taskListId) {
        dispatch({
          type: "ADD",
          payload: {
            text,
            taskListId,
            status: taskStatus ? taskStatus : TaskStatus.Todo,
          },
        });
        setText("");
      }
    }
    setTaskStatus(null);
    handleClose();
  }

  function handleDropdown(e?: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.stopPropagation();
    setDropdownExpanded(!dropdownExpanded);
  }

  return (
    <Dialog
      closeAfterTransition={false}
      sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      fullWidth
      maxWidth={"md"}
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
          handleSubmit(e);
        },
      }}
    >
      <DialogTitle className={"dialog-title"}>{listName}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <span className={"dialog-label"}>Task Status</span>
        </DialogContentText>
        <Dropdown>
          <div className={"dialog-dropdown"}>
            <MenuButton
              sx={{ minHeight: "1px", padding: "0 10px" }}
              variant={"solid"}
              color={
                taskStatus
                  ? checkColor(taskStatus)
                  : task
                    ? checkColor(task.status)
                    : undefined
              }
              size={"sm"}
              onClick={(e) => handleDropdown(e)}
            >
              <div className={"dialog-button"}>
                {formatTextWithCapitalization(
                  taskStatus
                    ? taskStatus
                    : task
                      ? task.status
                      : TaskStatus.Todo,
                )}
                {dropdownExpanded ? (
                  <PiCaretUpBold className={"caret-icon"} />
                ) : (
                  <PiCaretDownBold className={"caret-icon"} />
                )}
              </div>
            </MenuButton>
          </div>
          <Menu style={{ zIndex: 10001 }}>
            {Object.values(TaskStatus).map(
              (status) =>
                status !== TaskStatus.AllTasks && (
                  <MenuItem
                    aria-label={`Dropdown option ${status}`}
                    key={status}
                    onClick={() => {
                      handleDropdown();
                      setTaskStatus(status);
                    }}
                  >
                    {formatTextWithCapitalization(status)}
                  </MenuItem>
                ),
            )}
          </Menu>
        </Dropdown>
        <DialogContentText>
          <span className={"dialog-label"}>Task Description</span>
        </DialogContentText>
        <FormControl fullWidth>
          <Textarea
            autoFocus
            placeholder="Write your task here..."
            minRows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskModal;
