import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Modal, Stack, TextField } from "@mui/material";
import React from "react";
import EditIcon from '@mui/icons-material/Edit';
import { AddCircleRounded } from "@mui/icons-material";

export interface PropertyBoardProps {
    canModify: boolean;
    onChange: (key: string, value: string, action: 'addvalue' | 'delvalue' | 'replacekey' | 'delkey' | 'addkey', properties: {
        [key: string]: string | string[];
    }) => void;
    properties: {
        [key: string]: string | string[];
    }
}

export default function PropertyBoard({ canModify, onChange, properties }: PropertyBoardProps) {
    const [modal, setModal] = React.useState<React.JSX.Element>();

    const createDialog = (onSubmit: (value: string) => void, defaultValue?: string) => {
        console.log("createDialog");
        setModal(
            <AddModal open={true} handleClose={() => setModal(undefined)} onSubmit={onSubmit} defaultValue={defaultValue} />
        );
    }

    const onDeleteKey = (key: string) => {
        onChange(key, "", 'delkey', properties);
    }

    const onDeleteValue = (key: string, value: string) => {
        onChange(key, value, 'delvalue', properties);
    }

    return (
        <Stack spacing={2} width={"100%"}>
            {canModify && <Box>
                <Chip label="Add A New Key" color="primary" onClick={
                    () => createDialog((v) => {
                        onChange(v, "", 'addkey', properties);
                    })
                } />
            </Box>}
            {Object.entries(properties).map(([key, value], index) => (
                <Box key={index} display="flex" flexDirection="row" alignItems="center">
                    <Box width={"20%"}>
                        <Chip
                            label={key}
                            onDelete={canModify ? () => onDeleteKey(key) : undefined}
                        />
                    </Box>
                    <Box width={"70%"}>
                        {Array.isArray(value) ? (
                            <>
                                {value.map(v => {
                                    return (
                                        <Chip
                                            key={v}
                                            label={v}
                                            onDelete={canModify ? () => onDeleteValue(key, v) : undefined}
                                        />
                                    );
                                })}
                            </>
                        ) : (
                            <Chip
                                icon={canModify ? <EditIcon /> : undefined}
                                label={value}
                                color="primary"
                                onClick={canModify ? () => createDialog((v) => {
                                    onChange(key, v, 'replacekey', properties)
                                }, value as string) : undefined}
                            />)
                        }
                        {canModify && <Chip
                            icon={<AddCircleRounded />}
                            label="Add A New Value"
                            color="primary"
                            onClick={canModify ? () => createDialog((v) => {
                                onChange(key, v, 'addvalue', properties)
                            }) : undefined}
                        />}
                    </Box>
                </Box>
            ))}
            {modal}
        </Stack>
    );
}

// 添加key和value的功能
interface ModalProps {
    open: boolean,
    handleClose: () => void,
    onSubmit: (value: string) => void
    defaultValue?: string
}
function AddModal({ open, handleClose, onSubmit, defaultValue }: ModalProps) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries((formData as any).entries());
                        onSubmit(formJson.objectKey);
                        handleClose();
                    },
                },
            }}
        >
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="objectKey"
                    label="Please Enter"
                    fullWidth
                    variant="standard"
                    defaultValue={defaultValue}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Commit</Button>
            </DialogActions>
        </Dialog>
    );
}