import { Middleware } from '@koa/router'
import jwt from 'jsonwebtoken'
import User from '../models/user'

interface SubscribeUserToken extends jwt.JwtPayload {
  _id: string
  username: string
}

const jwtMiddleware: Middleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token')
  if (!token) {
    return next()
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as SubscribeUserToken
    const { _id, username, iat, exp } = decoded
    ctx.state.user = { _id, username }
    // 토큰의 남은 유효 기간이 3.5일 미만이면 재발급
    const now = Math.floor(Date.now() / 1000)
    if (exp && exp - now < 60 * 60 * 24 * 3.5) {
      const user = await User.findById(_id)
      if (!user) {
        // 로직상 문제가 없지만 에러핸들링
        ctx.state = 500
        return
      }
      const token = user.generateToken()
      ctx.cookies.set('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
        httpOnly: true
      })
    }
    return next()
  } catch (e) {
    return next()
  }
}

export default jwtMiddleware
