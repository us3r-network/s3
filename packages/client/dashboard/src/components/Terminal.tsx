/*
 * @Author: bufan bufan@hotmail.com
 * @Date: 2023-12-18 13:28:56
 * @LastEditors: bufan bufan@hotmail.com
 * @LastEditTime: 2023-12-25 16:52:23
 * @FilePath: /s3/packages/client/dashboard/src/components/Terminal.tsx
 * @Description:
 */
import { useMemo, useEffect } from 'react'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { CERAMIC_NODE_SERVICE_WSS_URL } from '../constants'
import { io } from 'socket.io-client'

const ANSI_COLOR = {
  red: '\x1B[1;3;31m',
  green: '\x1B[1;3;32m',
  yellow: '\x1B[1;3;33m',
  blue: '\x1B[1;3;34m',
  magenta: '\x1B[1;3;35m',
  cyan: '\x1B[1;3;36m',
  white: '\x1B[1;3;37m',
  reset: '\x1B[0m'
}
const WELCOME_TEXT = [
  `${ANSI_COLOR.yellow}************************************************`,
  'Welcome to Ceramic Node!',
  'This is a terminal for your node.',
  'You can use it to check the status of your node.',
  `************************************************${ANSI_COLOR.reset}`
]
const REGS = {
  time: '((?:2|1)\\d{3}(?:-|/)(?:(?:0[1-9])|(?:1[0-2]))(?:-|/)(?:(?:0[1-9])|(?:[1-2][0-9])|(?:3[0-1]))(?:T|\\s)(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9])[.][0-9]{3,9}[Z])',
  importants: 'IMPORTANT:',
  error: 'ERROR:'
}
export default function NodeTerminal ({
  ceramicId,
  didSession
}: {
  ceramicId: number
  didSession: string
}): JSX.Element {
  const terminal: Terminal = useMemo(
    () =>
      new Terminal({
        cursorStyle: 'underline',
        cursorBlink: true,
        theme: {
          foreground: '#dddddd',
          cursor: 'gray'
        },
        allowTransparency: true,
        // windowsMode: true,
        disableStdin: true
      }),
    []
  )

  const socket = io(CERAMIC_NODE_SERVICE_WSS_URL, {
    transports: ['websocket']
  })
  const fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)

  useEffect(() => {
    const terminalDom = document.getElementById('terminal-container')
    // console.log('terminalDom', terminalDom)
    if (terminalDom && !terminalDom?.hasChildNodes()) {
      terminal.open(terminalDom as HTMLElement)
      fitAddon.fit()
    }
    return () => {
      // terminal.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initSocket = (ceramicId: number, didSession: string) => {
    // console.log('init socket', ceramicId, didSession)
    if (!ceramicId || !didSession) return
    if (!socket.hasListeners('connect')) {
      // console.log('init socket listeners...')
      socket.on('connect', function () {
        // console.log('connected', socket.id)
        // input
        //   terminal.onData(data => {
        //     console.log('terminal onData', data)
        //     socket.emit('events', { ceramicId: ceramicId, didSession: didSession })
        //   })
        terminal.clear()
        WELCOME_TEXT.forEach((text: string) => {
          if (text === '') return
          terminal.write(text + '\r\n')
        })
        socket.emit('events', {
          ceramicId: ceramicId,
          didSession: didSession
        })
      })
    }
    if (!socket.hasListeners('events')) {
      socket.on('events', function (data) {
        // console.log('events', socket.id)
        const logs = data.log.split('\n')
        logs.forEach((log: string) => {
          if (log === '') return
          // time
          log = log.replace(
            new RegExp(REGS.time, 'g'),
            `${ANSI_COLOR.green}$1${ANSI_COLOR.reset}`
          )
          // importants
          log = log.replace(
            new RegExp(REGS.importants, 'g'),
            `${ANSI_COLOR.magenta}${REGS.importants}${ANSI_COLOR.reset}`
          )
          // importants
          log = log.replace(
            new RegExp(REGS.error, 'g'),
            `${ANSI_COLOR.red}${REGS.error}${ANSI_COLOR.reset}`
          )
          terminal.write(log + '\r\n')
        })
      })
    }
    if (!socket.hasListeners('exception')) {
      socket.on('exception', function (data) {
        // console.log('exception', socket.id, data)
        if (data.code === 1) {
          // terminal.write(
          //   `${ANSI_COLOR.red}${data.message}${ANSI_COLOR.reset}\r\n`
          // )
          terminal.write(
            `...`
          )
          setTimeout(() => {
            socket.emit('events', {
              ceramicId: ceramicId,
              didSession: didSession
            })
          }, 1000)
        }
      })
    }
    if (!socket.hasListeners('disconnect')) {
      socket.on('disconnect', function (reason) {
        // terminal.write('Bye Bye! \r\n')
        console.log('disconnected', socket.id, reason)

        terminal.clear()
      })
    }
  }
  useEffect(() => {
    if (ceramicId && didSession && !socket.connected) {
      initSocket(ceramicId, didSession)
    }
    return () => {
      // socket.off('connect')
      // socket.off('events')
      // socket.off('exception')
      // socket.off('disconnect')
      // socket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceramicId, didSession])

  return (
    <div
      id='terminal-container'
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}
