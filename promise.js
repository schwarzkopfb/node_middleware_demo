const startServer = require('./shared/server')
const db = require('./shared/database')

class Middleware {
    constructor() {
        this.stack = []
    }

    use(fn) {
        this.stack.push(fn)
    }

    execute(...args) {
        const { stack } = this

        function next(i) {
            const fn = stack[ i ]

            if (fn) 
                return Promise.resolve(fn(...args, () => next(i + 1)))
        }

        return next(0)
    }
}

const mw = new Middleware

mw.use(async (req, res, next) => {
    const time = Date.now()
    console.log('-->', req.method, req.url)
    await next()
    console.log('<--', req.method, req.url, res.stautusCode, Date.now() - time)
})

mw.use(async (req, res, next) => {
    req.query = new URL(req.url, 'http://localhost:3333').searchParams
    await next()
})

mw.use(async (req, res, next) => {
    try {
        const session = await db.sessions.find_slow({ id: req.query.get('sessionId') })

        if (session)
            req.user = await db.users.find_error({ id: session.userId })

        await next()
    }
    catch(ex) {
        res.stautusCode = 500
        res.end('database error occurred')
    }
})

mw.use((req, res) => {
    res.stautusCode = 200

    if(req.user)
        res.end('Hello ' + req.user.name + '!')
    else
        res.end('Hello MiddleWorld!')
})

startServer(mw, 3333)
