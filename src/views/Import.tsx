import Button from "@mui/material/Button";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Stack, TextField } from "@mui/material";
import { importMusicTransaction, Music, MusicBuilder, MusicProperties } from "@/core/models/music";
import { useLocation, useRoute } from "wouter";
import { generateUUIDv4 } from "@/core/utils";
import { Notify } from "@/core/notify";
import PropertyBoard, { PropertyBoardProps } from "@/components/PropertyBoard";

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
    const [properties, setProperties] = React.useState<Partial<MusicProperties>>({
        uuid: generateUUIDv4(),
        title: '',
        thumbnail: undefined,
        properties: {},
        status: {
            local: true,
            remote: [],
        }
    });

    React.useEffect(() => {
        if (ok) {
            MusicBuilder.make(params.uuid).then((builder) => {
                setProperties({
                    uuid: builder.params.uuid,
                    properties: builder.params.properties,
                    title: builder.params.title,
                    thumbnail: builder.params.thumbnail,
                    status: builder.params.status,
                });
                if (builder.cover) {
                    setImageFile(builder.cover);
                }
                if (builder.blob) {
                    setAudioFile(builder.blob);
                }
            });
        }
    }, [params && params!.uuid]);

    const disableSubmit = React.useMemo(() => {
        if (audioFile) {
            return false;
        }
        return true;
    }, [audioFile, properties]);

    const memoProperties = React.useMemo(() => {
        console.log("memoProperties", properties.properties);
        return properties.properties ?? {};
    }, [properties.properties]);

    const onSubmit = async () => {
        if (disableSubmit) {
            return;
        }
        const builder = MusicBuilder.load(properties as MusicProperties);
        const { music, blob, cover } = builder.build();
        await importMusicTransaction(music, audioFile!, imageFile!);
        Notify.success("Success");
        navigate('/playlist/');
    }

    const onPropertiesChange: PropertyBoardProps['onChange'] = (_key, _value, _action, _properties) => {
        let newProperties: MusicProperties['properties'] = _properties || {};
        console.log("onPropertiesChange", _action, _key, _value, newProperties);
        switch (_action) {
            case 'addkey':
                newProperties[_key] = "null";
                break;
            case 'delkey':
                delete newProperties[_key];
                break;
            case 'addvalue':
                if (!Array.isArray(newProperties[_key])) {
                    newProperties[_key] = [newProperties[_key]];
                }
                newProperties[_key].push(_value);
                break;
            case 'delvalue':
                newProperties[_key] = (newProperties[_key] as string[]).filter((v: string) => v !== _value);
                break;
            case 'replacekey':
                newProperties[_key] = _value;
                break;
        }
        setProperties({
            ...properties,
            properties: newProperties,
        });
    }

    return (
        <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
            <h3>Import</h3>
            <Stack spacing={2}>

                <TextField id="outlined-basic" label="Title" variant="outlined"
                    value={properties?.title}
                    onChange={(event) => {
                        setProperties({
                            ...properties,
                            title: event.target.value,
                        })
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
                                if (size > _MB(10)) {
                                    alert('File size should be smaller than 10MB')
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
                                const size = f.size
                                if (size > _MB(20)) {
                                    alert('Audio size should be smaller than 20MB')
                                    return
                                }
                                const f_name = f.name.split('.')[0]
                                setAudioFile(f)
                                setProperties({
                                    ...properties,
                                    title: f_name,
                                })
                            }
                        }}
                    />
                </Button>

                <PropertyBoard
                    properties={memoProperties}
                    canModify
                    onChange={onPropertiesChange}
                />

                <Button variant="contained" disabled={disableSubmit} onClick={onSubmit}>Submit</Button>
            </Stack>
        </Box>
    );
}

const _MB = (x: number) => 1024 * 1024 * x
function computeFileSize(size: number) {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
}

function autoSplitFileName(name: string) {
    let title;
    let artist;
    let album;
    if (name.includes('-')) {
        const parts = name.split('-');
        artist = parts[0];
        title = parts[1];
        album = parts[0];
    } else {
        title = name;
        artist = 'unknown';
        album = 'unknown';
    }
    return { title, artist, album };
}

