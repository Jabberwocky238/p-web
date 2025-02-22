import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";

// 添加key和value的功能
interface ModalProps<T> {
    open: boolean,
    handleClose: () => void,
    onSubmit: (value: T) => void
    defaults?: T
}

export function DialogModal({ open, handleClose, onSubmit, defaultValue }: ModalProps<T>) {
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