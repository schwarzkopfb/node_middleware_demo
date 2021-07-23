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
        let i = 0

        function next() {
            const fn = stack[ i++ ]
            if (fn) fn(...args, next)
        }

        next()
    }
}

const mw = new Middleware

mw.use((req, res, next) => {
    console.log(req.method, req.url)
    next()
})

mw.use((req, res, next) => {
    req.query = new URL(req.url, 'http://localhost:3333').searchParams
    next()
})

mw.use((req, res, next) => {
    db.sessions.find({ id: req.query.get('sessionId') }, (err, session) => {
        if (err) {
            res.stautusCode = 500
            res.end('database error occurred')
        }
        else if (session) {
            db.users.find({ id: session.userId }, (err, user) => {
                if (err) {
                    res.stautusCode = 500
                    res.end('database error occurred')
                }
                else {
                    req.user = user
                    next()
                }
            })
        }
        else
            next()
    })
})

mw.use((req, res) => {
    res.stautusCode = 200

    if(req.user)
        res.end('Hello ' + req.user.name + '!')
    else
        res.end('Hello MiddleWorld!')
})

startServer(mw, 3333)
