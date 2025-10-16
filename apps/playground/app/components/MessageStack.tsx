import {type FunctionComponent, type PropsWithChildren} from 'react'
import type {RenderedMessage} from '../types'
import {MessageEntry} from './MessageEntry'

export const MessageStack: FunctionComponent<
  PropsWithChildren<{
    messages: RenderedMessage[]
  }>
> = (props) => {
  const {messages} = props
  return (
    <div className="flex flex-grow flex-col gap-2 overflow-x-hidden overflow-y-scroll p-4">
      {messages.map((message, i) => (
        <MessageEntry key={'id' in message ? message.id : i} message={message} />
      ))}
    </div>
  )
}
