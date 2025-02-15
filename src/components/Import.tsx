import Button from "@mui/material/Button";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Stack, TextField } from "@mui/material";
import { Music, MusicParams } from "../core/models/music";
import { useLocation, useRoute } from "wouter";

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
    const [ok, params] = useRoute("/import/:uuid");
    const [location, navigate] = useLocation();

    const [audioFile, setAudioFile] = React.useState<File | null>(null);
    const [imageFile, setImageFile] = React.useState<File | null>(null);
    const [musicObj, setMusicObj] = React.useState<MusicParams>({
        uuid: generateUUIDv4(),
        title: "",
        artist: "",
        album: "",
        version: "1.0.0",
    });

    React.useEffect(() => {
        if (ok) {
            const uuid = params.uuid;
            async function fetchData() {
                const music = await Music.fromUUID(uuid);
                if (music) {
                    console.log("has music", music);

                    setMusicObj(music);
                    const cover = await music.getCoverFile();
                    setImageFile(cover);
                    const blob = await music.getSrcFile();
                    setAudioFile(blob);
                } else {
                    console.log("no music");
                }
            }
            fetchData();
        }
    }, [params && params!.uuid]);

    const disableSubmit = React.useMemo(() => {
        if (audioFile) {
            return false;
        }
        return true;
    }, [audioFile, musicObj]);

    const onSubmit = async () => {
        if (disableSubmit) {
            return;
        }
        const music = Music.fromParams(musicObj);
        await music.dumpToDB(audioFile!, imageFile);
        alert('Success');
        navigate('/playlist/');
    }

    return (
        <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
            <h3>Import</h3>
            <Stack spacing={2}>
                <TextField id="outlined-basic" label="Title" variant="outlined"
                    value={musicObj.title}
                    onChange={(event) => {
                        // console.log(event.target.value)
                        setMusicObj({ ...musicObj, title: event.target.value })
                    }}
                />
                <TextField id="outlined-basic" label="Artist" variant="outlined"
                    value={musicObj.artist}
                    onChange={(event) => {
                        // console.log(event.target.value)
                        setMusicObj({ ...musicObj, artist: event.target.value })
                    }}
                />
                <TextField id="outlined-basic" label="Album" variant="outlined"
                    value={musicObj.album}
                    onChange={(event) => {
                        // console.log(event.target.value)
                        setMusicObj({ ...musicObj, album: event.target.value })
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
                        accept="image/*"
                        multiple={false}
                        type="file"
                        onChange={(event) => {
                            // console.log(event.target.files)
                            if (event.target.files) {
                                const size = event.target.files[0].size
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
                        accept="audio/*"
                        multiple={false}
                        onChange={(event) => {
                            console.log(event.target.files)
                            if (event.target.files) {
                                const f = event.target.files[0]
                                const f_name = f.name.split('.')[0]
                                setAudioFile(f)
                                setMusicObj({
                                    ...musicObj,
                                    title: f_name.split('-')[1],
                                    artist: f_name.split('-')[0],
                                    album: f_name.split('-')[0],
                                })
                            }
                        }}
                    />
                </Button>
                <Button variant="contained" disabled={disableSubmit} onClick={onSubmit}>Submit</Button>
            </Stack>
        </Box>
    );
}

const _2MB = 1024 * 1024 * 2
function computeFileSize(size: number) {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
}

function generateUUIDv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const randomHex = Math.random() * 16 | 0; // 生成 0-15 的随机整数
        const value = char === 'x' ? randomHex : (randomHex & 0x3 | 0x8); // 生成符合规则的数字
        return value.toString(16); // 转换为十六进制字符串
    });
}
