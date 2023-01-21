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

export default function Cursor(props: CursorProp) {
    const cursorElemRef = useRef(null);
    const [mousePosition, setMousePosition] = useState<MousePosition>({x: 0, y: 0})
    const [mouseVisible, setMouseVisible] = useState(false)
    // const [cursorSize, setCursorSize] = useState(32)
    const [cursorScale, setCursorScale] = useState(1)
    const [viewportWidthHeight, setViewportWidthHeight] = useState({width: 0, height: 0})
    const [cursorColor, setCursorColor] = useState(props.hexColor)
    const [SVGImage, setSVGImage] = useState(props.svg)

    useEffect(() => {
        console.log(viewportWidthHeight)
    }, [viewportWidthHeight])

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

        let cursorSize = 32;
        let animatedCursorSize = 32;
        let mouseFadeOffsetSize = 20;

        const mouse = Mouse.getInstance()
        const ticker = Ticker.getInstance()
        const viewport = Viewport.getInstance({fireViewportInformationOnListen: true})

        viewport!.on('resize', (resizeEvent: any) => {
            viewportInformation.width = resizeEvent.width;
            viewportInformation.height = resizeEvent.height;
            setViewportWidthHeight({
                width: resizeEvent.width,
                height: resizeEvent.height
            })
        })

        mouse!.on('move', (mouseEvent: any) => {
            if (!mouseVisible) {
                setMouseVisible(true)
            }
            position.x = mouseEvent.x
            position.y = mouseEvent.y


            if (mouseEvent.x < mouseFadeOffsetSize ||
                mouseEvent.x > viewportInformation.width - mouseFadeOffsetSize ||
                mouseEvent.y < mouseFadeOffsetSize ||
                mouseEvent.y > viewportInformation.height - mouseFadeOffsetSize
            ) {
                cursorSize = 0
            } else if (mouseEvent.y > 500) {
                cursorSize = 64
            } else {
                cursorSize = 32
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
                animatedPosition.x += ((position.x - (width/2)) - animatedPosition.x) * 0.1 * speed
                animatedPosition.y += ((position.y - (height/2)) - animatedPosition.y) * 0.1 * speed


                //animate mouse position
                setMousePosition({
                    x: animatedPosition.x,
                    y: animatedPosition.y
                })

                //animated mouse size, cursorSize is used to determine scaling effect.
                animatedCursorSize += (cursorSize - animatedCursorSize) * 0.1 * speed
                setCursorScale(animatedCursorSize / width)
            }
        })
    }, [])

    const display = mouseVisible ? 'flex' : 'none'
//    const transformString = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ${mousePosition.x}, ${mousePosition.y}, 0, 1)`
    const transformString = `matrix(${cursorScale}, 0, 0, ${cursorScale}, ${mousePosition.x}, ${mousePosition.y})`
    return (
        <>
            <div ref={cursorElemRef} className="cursor" style={{
                    backgroundColor: `${cursorColor}`,
                    display: `${display}`,
                    transform: `${transformString}`
                }}>
                {SVGImage !== undefined &&
                    <img src={SVGImage} className="bean" alt="Bean Cursor" />
                }
            </div>
        </>
    )
}