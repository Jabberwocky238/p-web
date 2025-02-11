import Button from "@mui/material/Button";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Stack, TextField } from "@mui/material";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function Settings() {
    const [audioFile, setAudioFile] = React.useState<File | null>(null);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [title, setTitle] = React.useState<string>('');

    const disableSubmit = React.useMemo(() => {
        if (audioFile && title.length !== 0) {
            return false;
        }
        return true;
    }, [audioFile, title]);

    const [_uploadStatus, setUploadStatus] = React.useState<string | null>(null);
    const onSubmit = async () => {
        if (disableSubmit) {
            return;
        }
        setUploadStatus('Ready to upload')
        // request presigned url
        const res1: Response = await fetch('http://localhost:23891/music/uploadPresign', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        setUploadStatus('Fetched presign url')
        const data1: {
            url: string,
            uuid: string
        } = await res1.json()
        setUploadStatus('Presign uuid: ' + data1.uuid)
        // upload file to s3
        setUploadStatus('Uploading audio file to s3')
        const res2 = await fetch(data1.url, {
            method: 'PUT',
            body: audioFile
        })
        setUploadStatus('Uploaded audio file to s3')
        // notify server
        setUploadStatus('Encoding cover iamge to base64')
        const blobImage = await imageFile?.bytes()
        const stringImage = blobImage ? blobImage.toString() : null
        setUploadStatus('Notifying server')
        const res3 = await fetch('http://localhost:23891/music/uploadFinished', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uuid: data1.uuid,
                title: title,
                coverBase64: stringImage ?? ""
            })
        })
        setUploadStatus('Notified')
        const data3 = await res3.json()
        console.log(data3)
        setUploadStatus('Finished')

        // const notification = new Notification('Upload finished', {
        //     body: `${title} has been uploaded successfully`
        // })

        setAudioFile(null)
        setImageFile(null)
        alert(`${title} has been uploaded successfully`)
    }

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box component="section" sx={{ width: '50%', p: 2, border: '1px dashed grey' }}>
                <h1>Settings</h1>
                {_uploadStatus && <div>{_uploadStatus}</div>}
                <Stack spacing={2}>
                    <div></div>
                    <TextField id="outlined-basic" label="Title" variant="outlined"
                        value={title}
                        onChange={(event) => {
                            console.log(event.target.value)
                            setTitle(event.target.value)
                        }}
                    />
                    {imageFile && <img src={URL.createObjectURL(imageFile)} alt="" />}
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload Cover Image
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => {
                                console.log(event.target.files)
                                if (event.target.files) {
                                    const size = event.target.files[0].size
                                    const _2MB = 1024 * 1024 * 2
                                    if (size > _2MB) {
                                        alert('File size should be smaller than 2MB')
                                        return
                                    }
                                    setImageFile(event.target.files[0])
                                }
                            }}
                        />
                    </Button>
                    {audioFile && <>
                        <audio controls src={URL.createObjectURL(audioFile)} />
                        <div>{audioFile.name}</div>
                        <div>{computeFileSize(audioFile.size)}</div>
                    </>}
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload file
                        <VisuallyHiddenInput
                            type="file"
                            onChange={(event) => {
                                console.log(event.target.files)
                                if (event.target.files) {
                                    setTitle(event.target.files[0].name)
                                    setAudioFile(event.target.files[0])
                                }
                            }}
                        />
                    </Button>
                    <Button variant="contained" disabled={disableSubmit} onClick={onSubmit}>Submit</Button>
                </Stack>
            </Box>
        </div>
    );
}

function computeFileSize(size: number) {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
}