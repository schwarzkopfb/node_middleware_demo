function makeAsync(fn, timeout) {
    return function (query, cb) {
        const p = new Promise(resolve => setTimeout(() => resolve(fn(query)), timeout))

        if (typeof cb === 'function')
            p.then(result => cb(null, result), cb)
        else
            return p
    }
}

function asyncErr(query, cb) {
    const p = new Promise((_, reject) => reject(new Error('unknown database error')))

    if (typeof cb === 'function')
        p.then(result => cb(null, result), cb)
    else
        return p
}

function createDataSource(fn) {
    return { 
        find: makeAsync(fn, 0),
        find_slow: makeAsync(fn, 2500),
        find_error: asyncErr
    }
}

module.exports = {
    users: createDataSource(query => {
        if (query.id == 1)
            return {
                id: 1,
                name: 'Mr. Csicska'
            }
        else
            return null
    }),

    sessions: createDataSource(query => {
        if (query.id == 1) 
            return { 
                id: 1, 
                userId: 1, 
                createdAt: '2021-07-23' 
            }
        else
            return null
    })
}