declare var LocalContractStorage: any
declare var Blockchain: any
declare var module: any

interface IMessage {
    id: string
    subject: string
    content: string
    from: string
    to: string
    timestamp: string
    status?: 'normal' | 'deleted'
}

/**
 * @class Message
 */
class Message implements IMessage {
    id
    subject
    content
    from
    to
    timestamp
    status

    constructor(message: IMessage) {
        this.status = 'normal'

        for (const prop in message) {
            if (message.hasOwnProperty(prop)) {
                this[prop] = message[prop]
            }
        }
    }

    static toString(message: Message) {
        let result = {}
        for (const prop in message) {
            if (message.hasOwnProperty(prop)) {
                result[prop] = message[prop]
            }
        }
        return JSON.stringify(result)
    }
}


interface IMessageManagement {
    list(id: string): any
    send(from: string, to: string, subject: string, content: string): any
}

interface IMessagePool {
    [id: string]: Message[]
}

interface ILocalContractStorage {
    set(id: string, messageList: Message[]): number
    get(id: string): Message[]
}

/**
 * @class MessageManagement
 */
class MessageManagement implements IMessageManagement {
    private messagePool: IMessagePool & ILocalContractStorage

    constructor() {
        LocalContractStorage.defineMapProperty(this, 'messagePool', {
            stringify: (messageList: Message[]) => {
                const result: string[] = []
                for (const message of messageList) {
                    result.push(Message.toString(message))
                }
                return JSON.stringify(result)
            },
            parse: str => {
                const result: Message[] = []
                let messageStrList
                try {
                    messageStrList = JSON.parse(str) || []
                }
                catch(error) {
                    messageStrList = []
                }
                for (const messageStr of messageStrList) {
                    result.push(new Message(JSON.parse(messageStr)))
                }
                return result
            }
        })
    }

    // TODO
    private buildWelcomeMessage(to: string) {
        return new Message({
            id: genID(),
            subject: '欢迎',
            content: '欢迎使用 MESSENGER，一个基于 NEBULAS 的信息系统。希望你玩得开心。',
            from: 'Nick Wild',
            to,
            timestamp: +new Date() + '',
            status: 'normal',
        })
    }

    list(id: string): Message[] {
        if (id !== Blockchain.transaction.from) {
            return []
        }
        const list = this.messagePool.get(id)
        if (!list || !list.length) {
            return [this.buildWelcomeMessage(id)]
        }
        return list
    }

    send(
        from: string,
        to: string,
        subject: string,
        content: string
    ) {
        const trimmedFromAddress = from.trim()
        const trimmedToAddress = to.trim()
        const trimmedSubject = subject.trim()
        const trimmedContent = content.trim()

        if (trimmedFromAddress !== Blockchain.transaction.from) {
            return
        }

        if (!trimmedFromAddress) {
            throw new Error('Empty address')
        }
        if (!trimmedToAddress) {
            throw new Error('Empty address')
        }
        if (!Blockchain.verifyAddress(trimmedToAddress)) {
            throw new Error('Invalid address')
        }
        if (!trimmedSubject) {
            throw new Error('Empty subject')
        }
        if (trimmedSubject.length > 30 || trimmedContent.length > 100) {
            throw new Error('Message too long')
        }

        const idOfSender = Blockchain.transaction.from
        const timestamp = Blockchain.transaction.timestamp + '000'
        const listOfReceiver = this.messagePool.get(trimmedToAddress) || []

        const newMessage = new Message({
            id: genID(),
            subject: trimmedSubject,
            content: trimmedContent,
            from: idOfSender,
            to: trimmedToAddress,
            timestamp,
        })

        // Add new message to receiver's list
        if (listOfReceiver.length) {
            listOfReceiver.unshift(newMessage)
            this.messagePool.set(trimmedToAddress, listOfReceiver)
        }
        else {
            this.messagePool.set(trimmedToAddress, [newMessage])
        }

        // Add new message to sender's own list
        const listOfSender = this.messagePool.get(trimmedFromAddress) || []
        if (listOfSender.length) {
            listOfSender.unshift(newMessage)
            this.messagePool.set(trimmedFromAddress, listOfSender)
        }
        else {
            this.messagePool.set(trimmedFromAddress, [newMessage])
        }

        return 1
    }

    init() {
        // nothing
    }
}

/**
 * utils
 */
const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

const genID = (): string => {
    return s4() + '-' + s4() + '-' + s4() + '-' + s4()
}

module.exports = MessageManagement
