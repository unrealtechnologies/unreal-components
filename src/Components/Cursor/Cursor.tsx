import './Cursor.css'
import React, { useEffect, useRef, useState}  from 'react';
import { Mouse, Ticker, Viewport, Detector } from '@unreal/pan';
import CursorProp from "./CursorProps";
import CursorState from "./CursorState";

const setState = (props: CursorProp): CursorState => {
    return {
        color: props.hexColor,
        svg: props.svg,
        visible: false,
        x: 0,
        y: 0,
        scale: 1,
        size: props.size !== undefined ? props.size : 20,
        sizeLarge: props.sizeLarge !== undefined ? props.sizeLarge : 40,
        originalSize: props.size !== undefined ? props.size : 20
    }
}

export default function Cursor(props: CursorProp) {
    const [cursor, setCursor] = useState<CursorState>(setState(props))
    const [viewport, setViewport] = useState({
        width: 0,
        height: 0
    })

    const cursorElemRef = useRef(null);
    const myCursorState = useRef(cursor);
    const myViewportState = useRef(viewport)

    const updateCursorState = (cursorState: CursorState) => {
        myCursorState.current = cursorState
        setCursor(cursorState)
    }

    const updateViewportState = (viewportState: any) => {
        myViewportState.current = viewportState
        setViewport(viewportState)
    }

    useEffect(() => {
        // get instances of our tools
        const mouse = Mouse.getInstance()
        const ticker = Ticker.getInstance()
        const viewport = Viewport.getInstance({fireViewportInformationOnListen: true})

        // create a 'shadowState' to help ease animations with react. setState cause it to do a lot of unneeded
        // calculations and doesn't animate well. So in the shadow state we store the actual end values
        // and in the React state we set animation values. As they should be rendered.
        const shadowState: CursorState = setState(props)

        viewport!.on('resize', (resizeEvent: any) => {
            updateViewportState({
                width: resizeEvent.width,
                height: resizeEvent.height
            })
        })

        mouse!.on('move', (mouseEvent: any, rawEvent: any) => {
            if (!myCursorState.current.visible) {
                shadowState.visible = true
            }
            shadowState.x = mouseEvent.x
            shadowState.y = mouseEvent.y

            if (rawEvent.target.closest('a') !== null ||
                rawEvent.target.tagName === 'BUTTON' ||
                rawEvent.target.tagName === 'SELECT' ||
                rawEvent.target.tagName === 'TEXTAREA') {
                shadowState.size = shadowState.sizeLarge
            } else {
                const mouseFadeOffsetSize = 20
                if (mouseEvent.x < mouseFadeOffsetSize ||
                    mouseEvent.x > myViewportState.current.width - mouseFadeOffsetSize ||
                    mouseEvent.y < mouseFadeOffsetSize ||
                    mouseEvent.y > myViewportState.current.height - mouseFadeOffsetSize
                ) {
                    shadowState.size = 0
                } else {
                    shadowState.size = shadowState.originalSize
                }
            }
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
                //animated mouse size, cursorSize is used to determine scaling effect.
                const size = myCursorState.current.size + (shadowState.size - myCursorState.current.size) * 0.1 * speed
                updateCursorState({
                    x: myCursorState.current.x + ((shadowState.x - (width / 2)) - myCursorState.current.x) * 0.1 * speed,
                    y: myCursorState.current.y + ((shadowState.y - (height / 2)) - myCursorState.current.y) * 0.1 * speed,
                    size: size,
                    scale: size / width, // scale by width of element
                    color: myCursorState.current.color,
                    svg: myCursorState.current.svg,
                    visible: shadowState.visible,
                    originalSize: myCursorState.current.originalSize,
                    sizeLarge: myCursorState.current.sizeLarge,

                })
            }
        })
    }, [])
    const display = cursor.visible ? 'flex' : 'none'
    const transformString = `matrix(${cursor.scale}, 0, 0, ${cursor.scale}, ${cursor.x}, ${cursor.y})`
    return (
        <>
            <div ref={cursorElemRef} className="cursor" style={{
                    backgroundColor: `${cursor.color}`,
                    display: `${display}`,
                    transform: `${transformString}`
                }}>
                {cursor.svg !== undefined &&
                    <img src={cursor.svg} className="" alt="cursor" />
                }
            </div>
        </>
    )
}