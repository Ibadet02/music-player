import * as C from './styles';
import { Play, Pause, SkipBack, SkipForward, RandomMusicsTrue, RandomMusicsFalse, VolumeOff, VolumeOn } from '../../svgs';
import { musics } from '../../data/data';
import { useEffect, useRef, useState, useCallback } from 'react';

type Props = {
    id: string;
    isFull: boolean;
    setId: (e: string) => void;
    setIsFull: (e: boolean) => void;
    windowWidth: number;
}

export const Player = ({ id, setId, setIsFull, isFull, windowWidth }: Props) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(true)
    const [volume, setVolume] = useState<string>('1')
    const [duration, setDuration] = useState<number>(0)
    const [isRandom, setIsRandom] = useState<boolean>(false)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [isMuted, setIsMuted] = useState<boolean>(false)

    const audioTag = useRef(null)
    const progressBar = useRef(null)
    const animationRef = useRef(null)

    const skipForward = useCallback(() => {
        if (id === '') {
            alert('Choose a song!');
        } else if (isRandom) {
            skipRandom();
        } else if (id === '9') {
            setId('1');
        } else {
            const idNum = parseInt(id);
            const newId = idNum + 1;
            setId(newId.toString());
        }
    }, [id, isRandom, setId]);

    const skipRandom = useCallback(() => {
        const idNum = parseInt(id);
        const randomNum = Math.floor(Math.random() * 9);
        if (randomNum === 0 || randomNum === idNum) {
            const newNum = randomNum + 1;
            setId(newNum.toString());
        } else {
            setId(randomNum.toString());
        }
    }, [id, setId]); // Do not include skipRandom as a dependency
    
    

    const changeCurrentTime = useCallback(() => {
        setCurrentTime(progressBar.current.value);
    }, [progressBar, setCurrentTime]);

    const whilePlaying = useCallback(() => {
        if (windowWidth >= 830 || isFull) {
            progressBar.current.value = audioTag?.current?.currentTime;
            animationRef.current = requestAnimationFrame(whilePlaying);
            changeCurrentTime();
        }
    }, [windowWidth, isFull, progressBar, audioTag, changeCurrentTime]);

    useEffect(() => {
        if (id !== '') {
            if (isPlaying) {
                audioTag.current.play();
                animationRef.current = requestAnimationFrame(whilePlaying);
                audioTag.current.volume = volume;

                if (isMuted) {
                    audioTag.current.muted = true;
                } else {
                    audioTag.current.muted = false;
                }

                const interval = setInterval(() => {
                    const seconds = Math.floor(audioTag.current.duration);
                    setDuration(seconds);
                    if (windowWidth >= 830 || isFull) progressBar.current.max = seconds;
                }, 1000);

                const checkAudioEnd = () => {
                    if (duration > 0 || duration !== undefined) {
                        clearInterval(interval);
                        if (audioTag.current.currentTime === audioTag.current.duration) {
                            isRandom ? skipRandom() : skipForward();
                        }
                    }
                };

                // Set up a listener to check for audio end
                audioTag.current.addEventListener("ended", checkAudioEnd);

                // Clear the listener when the component unmounts
                return () => {
                    audioTag.current.removeEventListener("ended", checkAudioEnd);
                };
            } else {
                audioTag.current.pause();
                audioTag.current.volume = volume;
                cancelAnimationFrame(animationRef.current);
            }
        }
    }, [id, isPlaying, volume, isMuted, windowWidth, isFull, isRandom, duration, progressBar, skipForward, skipRandom, whilePlaying]);

    const calculateDuration = (sec: number) => {
        const minutes = Math.floor(sec / 60)
        const newMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
        const seconds = Math.floor(sec % 60)
        const newSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`

        return `${newMinutes}:${newSeconds}`
    }



    const skipBack = () => {
        if (id === '') {
            alert('Choose a song!')
        } else {
            const idNum = parseInt(id);
            const newId = idNum - 1;
            setId(newId.toString())
        }
    }

    const changeRange = () => {
        if (windowWidth >= 830 || isFull) {
            audioTag.current.currentTime = progressBar.current.value
            changeCurrentTime()
        }
    }


    return (
        <C.Container isFull={isFull}>

            <div className='musicDiv'>

                {musics.map(music => (

                    id === music.id ?

                        <div
                            onClick={() => setIsFull(windowWidth <= 820 && !isFull)} className='music' key={music.id}>
                            {!isFull ?
                                <>
                                    <img src={music.album_img} alt='album' />
                                    <div>
                                        <h1>{music.name}</h1>
                                        <h3>{music.author}</h3>
                                    </div>
                                </>
                                : ''
                            }
                            <audio src={music.audio} ref={audioTag} />
                        </div>
                        : ''
                ))
                }
            </div>
            <div className='player'>
                <div className='inputButtons'>
                    {isFull || windowWidth >= 830 ?
                        <div className='progressBar'>
                            <p className='PcurrentTime'>
                                {calculateDuration(currentTime)}
                            </p>
                            <input
                                type="range"
                                className='currentProgress'
                                defaultValue='0'
                                ref={progressBar}
                                onChange={changeRange}
                            />

                            <p className='Pduration'>
                                {(duration && !isNaN(duration)) &&
                                    calculateDuration(duration)}
                            </p>
                        </div>
                        : ''
                    }
                    <div className='buttons'>
                        {windowWidth >= 830 || isFull ?
                            <button
                                onClick={() => setIsRandom(!isRandom)} className='randomMusicsButton'>
                                {isRandom ? <RandomMusicsTrue /> : <RandomMusicsFalse />}
                            </button>
                            : ''
                        }
                        <button onClick={skipBack}>
                            <SkipBack />
                        </button>
                        <button
                            className='playPause'
                            onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <Pause /> : <Play />}
                        </button>
                        <button onClick={skipForward}>
                            <SkipForward />
                        </button>

                    </div>
                </div>
            </div>

            {windowWidth > 825 &&
                <div className='test'>
                    <button
                        className='volumeButton'
                        onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeOff /> : <VolumeOn />}
                    </button>
                    <input
                        type="range"
                        step="0.01"
                        onChange={(e) => setVolume(e.target.value)}
                        value={volume}
                        max='1'
                        min='0'
                    />
                </div>
            }
        </C.Container>
    )
}