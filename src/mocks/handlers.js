import { rest } from 'msw'

export const handlers = [
    rest.post('https://k618de24a93cca.user-app.krampoline.com/login', (req, res, ctx) => {
        const { id, password } = req.body;
        console.log('request receiverd: ', {id, password});

        if(id === 'test' && password === '1234') {
            return res(
                ctx.status(200),
                ctx.json({
                token: 'fake-token',
                role: 'USER'
            }))
        }
        return res(
            ctx.status(401),
            ctx.json({
                message: 'login failed'
            })
        )
    }),
];