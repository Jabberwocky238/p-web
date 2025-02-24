import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

// 添加key和value的功能
interface ModalProps {
    open: boolean,
    handleClose: () => void,
    onSubmit: (value: any) => void
    children: React.ReactNode,
}

export function DialogModal({ open, handleClose, onSubmit, children }: ModalProps) {
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
                        onSubmit(formJson);
                        handleClose();
                    },
                },
            }}
        >
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Commit</Button>
            </DialogActions>
        </Dialog>
    );
}