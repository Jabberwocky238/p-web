import Button from "@mui/material/Button";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Stack, TextField } from "@mui/material";


import { Music, MusicBuilder } from "../core/musicModel";
import { IDBPDatabase } from "idb";
import { addData, initDB } from "../core/indexedDB";

function generateUUIDv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const randomHex = Math.random() * 16 | 0; // 生成 0-15 的随机整数
        const value = char === 'x' ? randomHex : (randomHex & 0x3 | 0x8); // 生成符合规则的数字
        return value.toString(16); // 转换为十六进制字符串
    });
}

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

    const [db, setDB] = React.useState<IDBPDatabase | null>(null);

    React.useEffect(() => {
        (async () => {
            const db = await initDB();
            setDB(db);
        })()
    }, []);

    const disableSubmit = React.useMemo(() => {
        if (audioFile && title.length !== 0) {
            return false;
        }
        return true;
    }, [audioFile, title]);

    const onSubmit = async () => {
        if (disableSubmit) {
            return;
        }
        const music = MusicBuilder({
            uuid: generateUUIDv4(),
            title: title,
            artist: "me",
            album: "my album",
            version: "1.0.0",
            file: audioFile!,
            cover: imageFile ? imageFile : "/default-album-pic.jfif",
        });
        await addData(db!, music);
    }

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box component="section" sx={{ width: '50%', p: 2, border: '1px dashed grey' }}>
                <h1>Import</h1>
                <Stack spacing={2}>
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