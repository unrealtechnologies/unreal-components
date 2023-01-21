import './Cursor.css'
import {useEffect, useRef, useState} from "react";
import { Mouse, Ticker, Viewport } from '@unreal/pan';
import CursorProp from "./CursorProps";
interface MousePosition {
    x: number
    y: number
}

function Lerp(start: number, end: number, t: number): number {
    return (1 - t) * start + t * end
}

interface CursorState {
    x: number,
    y: number,
    scale: number,
    visible: boolean,
    color: string,
    svg?: string,
    size: number
}

export default function Cursor2(props: CursorProp) {
    const cursorElemRef = useRef(null);
    const [cursor, setCursor] = useState<CursorState>({
        color: props.hexColor,
        svg: props.svg,
        visible: false,
        x: 0,
        y: 0,
        scale: 1,
        size: props.size || 20
    })

    const myCursorState = useRef(cursor);

    const updateCursorState = (cursorState: any) => {
        myCursorState.current = cursorState
        setCursor(cursorState)
    }


    useEffect(() => {
        const position: MousePosition = {
            x: 0,
            y: 0
        }
        const animatedPosition: MousePosition = {
            x: 0,
            y: 0
        }

        const viewportInformation = {
            width: 0,
            height: 0
        }

        let cursorSize = props.size || 20;
        let animatedCursorSize = props.size || 20;
        let mouseFadeOffsetSize = 20;

        const mouse = Mouse.getInstance()
        const ticker = Ticker.getInstance()
        const viewport = Viewport.getInstance({fireViewportInformationOnListen: true})

        viewport!.on('resize', (resizeEvent: any) => {
            viewportInformation.width = resizeEvent.width;
            viewportInformation.height = resizeEvent.height;
            // setViewportWidthHeight({
            //     width: resizeEvent.width,
            //     height: resizeEvent.height
            // })
        })

        mouse!.on('move', (mouseEvent: any) => {
            if (!myCursorState.current.visible) {
                updateCursorState({
                    color: myCursorState.current.color,
                    scale: myCursorState.current.scale,
                    size: myCursorState.current.size,
                    svg: myCursorState.current.svg,
                    x: myCursorState.current.x,
                    y: myCursorState.current.y,
                    visible: true
                })
            }
            position.x = mouseEvent.x
            position.y = mouseEvent.y

            // if (mouseEvent.x < mouseFadeOffsetSize ||
            //     mouseEvent.x > viewportInformation.width - mouseFadeOffsetSize ||
            //     mouseEvent.y < mouseFadeOffsetSize ||
            //     mouseEvent.y > viewportInformation.height - mouseFadeOffsetSize
            // ) {
            //     cursorSize = 0
            // } else if (mouseEvent.y > 500) {
            //     cursorSize = 30
            // } else {
            //     cursorSize = 20
            // }
        })

        ticker!.on('tick', (tickEvent: any) => {
            if (cursorElemRef.current !== null) {
                const elem = cursorElemRef.current as HTMLElement
                const width = elem.offsetWidth
                const height = elem.offsetHeight


                // the idea here is that the animation on new Mac laptops is really nice, because 120hz
                // on 60fps devices it feels a bit slower, so double the speed, usually this is not a problem
                // when animating against time elapsed, but this animation depends on times ran.
                const speed = Math.floor(tickEvent.delta / 8.3)

                // we apply a lerp effect to smooth our movement,
                // plus calculate the size of the cursor to factor it into the position
                animatedPosition.x += ((position.x - (width/2)) - animatedPosition.x) * 0.1 * speed
                animatedPosition.y += ((position.y - (height/2)) - animatedPosition.y) * 0.1 * speed


                //animated mouse size, cursorSize is used to determine scaling effect.
                animatedCursorSize += (cursorSize - animatedCursorSize) * 0.1 * speed
                // setCursorScale(animatedCursorSize / width)

                updateCursorState({
                    color: myCursorState.current.color,
                    scale: animatedCursorSize / width, // scale by width of element
                    size: myCursorState.current.size,
                    svg: myCursorState.current.svg,
                    x: animatedPosition.x,
                    y: animatedPosition.y,
                    visible: true
                })
            }
        })
    }, [])

    const display = cursor.visible ? 'flex' : 'none'
//    const transformString = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ${mousePosition.x}, ${mousePosition.y}, 0, 1)`
    const transformString = `matrix(${cursor.scale}, 0, 0, ${cursor.scale}, ${cursor.x}, ${cursor.y})`
    return (
        <>
            <div ref={cursorElemRef} className="cursor" style={{
                backgroundColor: `${cursor.color}`,
                display: `${display}`,
                transform: `${transformString}`
            }}>
                {cursor.svg !== undefined &&
                    <img src={cursor.svg} className="bean" alt="Bean Cursor" />
                }
            </div>
        </>
    )
}